import { FastifyInstance } from 'fastify';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync, createReadStream, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const YOLO_CMD = process.env.YOLO_CMD || 'yolo';

interface PredictInput {
  image_path?: string;
  image_dir?: string;
  model_path: string;
  conf?: number;
  iou?: number;
  output_dir?: string;
}

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff', '.webp']);

function findImages(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .sort();
}

export function registerMahjongPredictRoutes(app: FastifyInstance): void {
  app.post('/api/vision/mahjong/predict', async (request, reply) => {
    const input = (request.body || {}) as PredictInput;

    if (!input.model_path) {
      return reply.code(400).send({ success: false, input_count: 0, output_dir: '', preview_images: [], detections_summary: {}, error: 'model_path is required' });
    }

    if (!existsSync(input.model_path)) {
      return reply.code(400).send({ success: false, input_count: 0, output_dir: '', preview_images: [], detections_summary: {}, error: `model_path not found: ${input.model_path}` });
    }

    let sourceDir = input.image_dir || '';
    let singleImage = input.image_path || '';

    if (!sourceDir && !singleImage) {
      return reply.code(400).send({ success: false, input_count: 0, output_dir: '', preview_images: [], detections_summary: {}, error: 'image_path or image_dir is required' });
    }

    if (singleImage) {
      if (!existsSync(singleImage)) {
        return reply.code(400).send({ success: false, input_count: 0, output_dir: '', preview_images: [], detections_summary: {}, error: `image_path not found: ${singleImage}` });
      }
      sourceDir = resolve(singleImage, '..');
    }

    const outputDir = input.output_dir || join(sourceDir, '..', 'real_test_pred');

    if (!existsSync(outputDir)) {
      try { mkdirSync(outputDir, { recursive: true }); } catch {
        return reply.code(500).send({ success: false, input_count: 0, output_dir: outputDir, preview_images: [], detections_summary: {}, error: `cannot create output_dir: ${outputDir}` });
      }
    }

    const conf = input.conf ?? 0.25;
    const iou = input.iou ?? 0.45;

    let imageList: string[];
    if (singleImage) {
      imageList = [singleImage];
    } else {
      imageList = findImages(sourceDir);
    }

    if (imageList.length === 0) {
      return reply.send({ success: true, input_count: 0, output_dir: outputDir, preview_images: [], detections_summary: {}, error: 'no images found in source directory' });
    }

    const sourceArg = singleImage || sourceDir;

    try {
      const cmd = `${YOLO_CMD} detect predict model=${input.model_path} source=${sourceArg} conf=${conf} iou=${iou} save=True project=${outputDir} name=. exist_ok=True`;
      execSync(cmd, { timeout: 300000, windowsHide: true });

      const predictSubdir = join(outputDir, 'predict');
      let previewFiles: string[] = [];
      if (existsSync(predictSubdir)) {
        previewFiles = findImages(predictSubdir).map(f => join(predictSubdir, f));
      } else {
        previewFiles = findImages(outputDir).map(f => join(outputDir, f));
      }

      const previewImages = previewFiles.map(f => `/api/vision/mahjong/static/${encodeURIComponent(f)}`);

      return {
        success: true,
        input_count: imageList.length,
        output_dir: outputDir,
        preview_images: previewImages,
        detections_summary: {},
      };
    } catch (err: any) {
      return {
        success: false,
        input_count: imageList.length,
        output_dir: outputDir,
        preview_images: [],
        detections_summary: {},
        error: err.stderr?.toString() || err.message || 'prediction failed',
      };
    }
  });

  app.get('/api/vision/mahjong/static/:path', async (request, reply) => {
    const params = request.params as any;
    if (!params.path) {
      return reply.code(400).send({ error: 'path required' });
    }
    const filePath = decodeURIComponent(params.path);
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return reply.code(404).send({ error: 'file not found' });
    }
    const ext = extname(filePath).toLowerCase();
    const mime: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png', '.bmp': 'image/bmp',
      '.tif': 'image/tiff', '.tiff': 'image/tiff',
      '.webp': 'image/webp',
    };
    reply.header('Content-Type', mime[ext] || 'application/octet-stream');
    reply.header('Cache-Control', 'no-store');
    return reply.send(createReadStream(filePath));
  });
}

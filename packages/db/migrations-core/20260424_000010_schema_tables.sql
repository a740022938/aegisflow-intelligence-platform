-- Core schema tables (split from baseline)
-- Generated at: 2026-04-24T00:00:06.265Z
PRAGMA foreign_keys = ON;

-- table: approvals
CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        task_id TEXT DEFAULT '',
        action TEXT DEFAULT 'request',
        resource_type TEXT NOT NULL DEFAULT 'workflow_job',
        resource_id TEXT NOT NULL DEFAULT '',
        step_id TEXT,
        step_name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        policy_type TEXT DEFAULT 'manual',
        timeout_seconds INTEGER DEFAULT 0,
        expires_at TEXT,
        requested_by TEXT DEFAULT 'system',
        reviewed_by TEXT,
        reviewed_at TEXT,
        comment TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: artifacts
CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        artifact_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ready',
        source_type TEXT NOT NULL DEFAULT 'manual',
        training_job_id TEXT DEFAULT '',
        evaluation_id TEXT DEFAULT '',
        dataset_id TEXT DEFAULT '',
        parent_artifact_id TEXT DEFAULT '',
        model_family TEXT DEFAULT '',
        framework TEXT DEFAULT '',
        format TEXT DEFAULT '',
        version TEXT DEFAULT '',
        path TEXT DEFAULT '',
        file_size_bytes INTEGER,
        metadata_json TEXT DEFAULT '{}',
        metrics_snapshot_json TEXT DEFAULT '{}',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , promotion_status TEXT NOT NULL DEFAULT 'draft', promotion_comment TEXT DEFAULT '', approved_by TEXT DEFAULT '', approved_at TEXT DEFAULT '', sealed_at TEXT DEFAULT '', sealed_by TEXT DEFAULT '', release_id TEXT DEFAULT '', gate_status TEXT DEFAULT '');

-- table: assistant_diagnostic_requests
CREATE TABLE IF NOT EXISTS assistant_diagnostic_requests (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        job_id TEXT NOT NULL DEFAULT '',
        source_type TEXT NOT NULL DEFAULT '',
        severity TEXT NOT NULL DEFAULT '',
        probable_cause TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        evidence_refs_json TEXT NOT NULL DEFAULT '{}',
        request_payload_json TEXT NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        response_summary TEXT NOT NULL DEFAULT '',
        response_json TEXT NOT NULL DEFAULT '{}',
        adoption_status TEXT NOT NULL DEFAULT '',
        adoption_note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , gate_decision TEXT NOT NULL DEFAULT '', gate_reason TEXT NOT NULL DEFAULT '', reuse_hit INTEGER NOT NULL DEFAULT 0, reuse_hint_json TEXT NOT NULL DEFAULT '{}', manual_confirmation_required INTEGER NOT NULL DEFAULT 0, manual_confirmation_status TEXT NOT NULL DEFAULT '', manual_confirmation_actor TEXT NOT NULL DEFAULT '', manual_confirmation_note TEXT NOT NULL DEFAULT '', response_time_ms INTEGER NOT NULL DEFAULT 0, pattern_backflow_id TEXT NOT NULL DEFAULT '', rule_backflow_id TEXT NOT NULL DEFAULT '', playbook_backflow_id TEXT NOT NULL DEFAULT '', gate_policy_hint_json TEXT NOT NULL DEFAULT '{}');

-- table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        result TEXT NOT NULL,
        detail_json TEXT,
        created_at TEXT NOT NULL
      , plugin_status TEXT, execution_mode TEXT, dry_run INTEGER DEFAULT 0, duration_ms INTEGER, approval_id TEXT);

-- table: b5_validation_results
CREATE TABLE IF NOT EXISTS b5_validation_results (
            id TEXT PRIMARY KEY,
            sample_type TEXT,
            sample_path TEXT,
            predicted_label TEXT,
            confidence REAL,
            is_accepted INTEGER,
            rejection_reason TEXT,
            threshold_used REAL,
            created_at TEXT
        );

-- table: classifier_results
CREATE TABLE IF NOT EXISTS classifier_results (
      id                    TEXT    PRIMARY KEY,
      yolo_annotation_id    TEXT,
      frame_batch_id       TEXT,
      video_batch_id       TEXT,
      crop_path            TEXT,
      crop_x1              INTEGER,
      crop_y1              INTEGER,
      crop_x2              INTEGER,
      crop_y2              INTEGER,
      yolo_original_class  TEXT,
      yolo_original_conf  REAL,
      classifier_model_path TEXT   DEFAULT 'E:/mahjong_vision',
      model_type           TEXT   DEFAULT 'ViT-B/16',
      execution_mode       TEXT   DEFAULT 'real',
      predicted_class_id  INTEGER,
      predicted_label      TEXT,
      confidence           REAL,
      is_accepted          INTEGER DEFAULT 0,
      rejection_reason     TEXT,
      top5_json            TEXT,
      infer_time_ms        INTEGER,
      dataset_version_id   TEXT,
      created_at          TEXT   DEFAULT (datetime('now'))
    );

-- table: classifier_verifications
CREATE TABLE IF NOT EXISTS classifier_verifications (
        verification_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_segmentation_id TEXT,
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        model_type TEXT DEFAULT 'resnet18',
        classifier_model_path TEXT DEFAULT '',
        execution_mode TEXT DEFAULT 'real',
        total_items INTEGER DEFAULT 0,
        accepted_count INTEGER DEFAULT 0,
        rejected_count INTEGER DEFAULT 0,
        uncertain_count INTEGER DEFAULT 0,
        avg_confidence REAL DEFAULT 0,
        avg_infer_time_s REAL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      , artifact_id TEXT DEFAULT "", total_infer_time_s REAL DEFAULT 0, error_message TEXT DEFAULT "", yolo_annotation_id TEXT, rejection_reason TEXT, confidence REAL);

-- table: dataset_pipeline_configs
CREATE TABLE IF NOT EXISTS dataset_pipeline_configs (
        id TEXT PRIMARY KEY,
        config_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        pipeline_type TEXT NOT NULL,
        steps_json TEXT DEFAULT '[]',
        default_params_json TEXT DEFAULT '{}',
        env_vars_json TEXT DEFAULT '{}',
        is_builtin INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: dataset_pipeline_runs
CREATE TABLE IF NOT EXISTS dataset_pipeline_runs (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL UNIQUE,
        dataset_id TEXT NOT NULL,
        pipeline_config_id TEXT,
        pipeline_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        config_json TEXT DEFAULT '{}',
        input_sample_count INTEGER DEFAULT 0,
        output_sample_count INTEGER DEFAULT 0,
        error_message TEXT DEFAULT '',
        started_at TEXT,
        finished_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: dataset_splits
CREATE TABLE IF NOT EXISTS dataset_splits (
        id TEXT PRIMARY KEY,
        dataset_pipeline_run_id TEXT,
        dataset_id TEXT NOT NULL,
        split_name TEXT NOT NULL,
        sample_count INTEGER DEFAULT 0,
        file_path TEXT DEFAULT '',
        record_count INTEGER DEFAULT 0,
        checksum TEXT DEFAULT '',
        config_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: dataset_version_approvals
CREATE TABLE IF NOT EXISTS dataset_version_approvals (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT NOT NULL,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        approver_id TEXT DEFAULT '',
        approver_name TEXT DEFAULT '',
        approval_comment TEXT DEFAULT '',
        gate_level TEXT DEFAULT '',
        gate_checks_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(dataset_version_id) REFERENCES dataset_versions(id)
      );

-- table: dataset_version_batches
CREATE TABLE IF NOT EXISTS dataset_version_batches (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT NOT NULL,
        batch_type TEXT NOT NULL,
        batch_id TEXT NOT NULL,
        batch_status TEXT DEFAULT '',
        record_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(dataset_version_id) REFERENCES dataset_versions(id)
      );

-- table: dataset_versions
CREATE TABLE IF NOT EXISTS dataset_versions (
  id TEXT PRIMARY KEY,
  dataset_id TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  split_manifest_path TEXT DEFAULT '',
  dataset_yaml_path TEXT DEFAULT '',
  summary_json TEXT DEFAULT '{}',
  created_at TEXT,
  updated_at TEXT
, task_type TEXT DEFAULT 'detection', label_format TEXT DEFAULT 'yolo', source_chain_json TEXT DEFAULT '{}', quality_chain_json TEXT DEFAULT '{}', governance_chain_json TEXT DEFAULT '{}', created_by TEXT DEFAULT '', sample_count INTEGER DEFAULT 0, train_count INTEGER DEFAULT 0, val_count INTEGER DEFAULT 0, test_count INTEGER DEFAULT 0, class_count INTEGER DEFAULT 0, storage_path TEXT DEFAULT '', description TEXT DEFAULT '');

-- table: datasets
CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        dataset_code TEXT,
        name TEXT,
        version TEXT,
        status TEXT DEFAULT 'active',
        task_type TEXT DEFAULT '',
        dataset_format TEXT DEFAULT '',
        class_count INTEGER DEFAULT 0,
        label_map_json TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
      , dataset_type TEXT DEFAULT 'other', storage_path TEXT DEFAULT '', label_format TEXT, sample_count INTEGER DEFAULT 0, train_count INTEGER DEFAULT 0, val_count INTEGER DEFAULT 0, test_count INTEGER DEFAULT 0, description TEXT DEFAULT '', tags_json TEXT DEFAULT '[]', meta_json TEXT DEFAULT '{}', source_task_id TEXT, source_template_code TEXT);

-- table: db_governance_runs
CREATE TABLE IF NOT EXISTS db_governance_runs (
      id TEXT PRIMARY KEY,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      summary_json TEXT NOT NULL DEFAULT '{}'
    );

-- table: deployment_logs
CREATE TABLE IF NOT EXISTS deployment_logs (
        id TEXT PRIMARY KEY,
        deployment_id TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

-- table: deployment_revisions
CREATE TABLE IF NOT EXISTS deployment_revisions (
        id TEXT PRIMARY KEY,
        deployment_id TEXT NOT NULL,
        package_id TEXT,
        artifact_id TEXT,
        revision_number INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'pending',
        config_snapshot_json TEXT DEFAULT '{}',
        deployed_at TEXT,
        health_status TEXT DEFAULT 'unknown',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );

-- table: deployment_targets
CREATE TABLE IF NOT EXISTS deployment_targets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_type TEXT NOT NULL DEFAULT 'server',
        host TEXT NOT NULL,
        port INTEGER DEFAULT 80,
        base_url TEXT DEFAULT '',
        region TEXT DEFAULT '',
        environment TEXT DEFAULT 'development',
        credentials_json TEXT DEFAULT '{}',
        config_json TEXT DEFAULT '{}',
        status TEXT DEFAULT 'active',
        last_health_check_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: deployments
CREATE TABLE IF NOT EXISTS deployments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        deployment_type TEXT NOT NULL,
        runtime TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'created',
        artifact_id TEXT,
        artifact_name TEXT,
        training_job_id TEXT,
        evaluation_id TEXT,
        host TEXT,
        port INTEGER,
        base_url TEXT,
        entrypoint TEXT,
        model_path TEXT,
        config_json TEXT,
        health_status TEXT DEFAULT 'unknown',
        last_health_check_at TEXT,
        started_at TEXT,
        stopped_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        notes TEXT
      );

-- table: detector_comparison
CREATE TABLE IF NOT EXISTS detector_comparison (
            id TEXT PRIMARY KEY,
            comparison_date TEXT,
            current_detector_path TEXT,
            candidate_detector_path TEXT,
            test_images_count INTEGER,
            current_detections INTEGER,
            current_valid INTEGER,
            current_avg_conf REAL,
            candidate_detections INTEGER,
            candidate_valid INTEGER,
            candidate_rejected INTEGER,
            candidate_avg_conf REAL,
            candidate_avg_val_conf REAL,
            results_json TEXT
        );

-- table: error_patterns
CREATE TABLE IF NOT EXISTS error_patterns (
        id TEXT PRIMARY KEY,
        pattern_name TEXT NOT NULL,
        step_key TEXT NOT NULL,
        error_type TEXT NOT NULL,
        message_fingerprint TEXT DEFAULT '',
        root_cause_class TEXT DEFAULT 'execution_error',
        recommended_actions_json TEXT DEFAULT '[]',
        latest_evidence_json TEXT DEFAULT '{}',
        hit_count INTEGER NOT NULL DEFAULT 0,
        last_seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , assistant_backflow_json TEXT NOT NULL DEFAULT "{}", assistant_adopted_count INTEGER NOT NULL DEFAULT 0, assistant_rejected_count INTEGER NOT NULL DEFAULT 0);

-- table: evaluation_logs
CREATE TABLE IF NOT EXISTS evaluation_logs (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT
      );

-- table: evaluation_metrics
CREATE TABLE IF NOT EXISTS evaluation_metrics (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        metric_key TEXT NOT NULL,
        metric_value TEXT NOT NULL,
        metric_text TEXT DEFAULT '',
        created_at TEXT
      );

-- table: evaluation_steps
CREATE TABLE IF NOT EXISTS evaluation_steps (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        message TEXT DEFAULT '',
        started_at TEXT,
        finished_at TEXT,
        created_at TEXT,
        updated_at TEXT
      );

-- table: evaluations
CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        evaluation_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        model_name TEXT DEFAULT '',
        artifact_name TEXT DEFAULT '',
        dataset_name TEXT DEFAULT '',
        dataset_id TEXT DEFAULT '',
        training_job_id TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        config_json TEXT DEFAULT '{}',
        result_summary_json TEXT DEFAULT '{}',
        error_message TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT,
        started_at TEXT,
        finished_at TEXT,
        experiment_id TEXT DEFAULT '',
        artifact_id TEXT DEFAULT ''
      , gate_status TEXT DEFAULT '', report_path TEXT DEFAULT '', eval_manifest_path TEXT DEFAULT '', dataset_version_id TEXT DEFAULT '', execution_mode TEXT DEFAULT 'standard', yolo_eval_config_json TEXT DEFAULT '{}', env_snapshot_json TEXT DEFAULT '{}', exit_code INTEGER DEFAULT 0, evaluation_report_json TEXT DEFAULT '{}', promote_gate_status TEXT DEFAULT 'pending', promote_gate_checks_json TEXT DEFAULT '{}');

-- table: experiments
CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY,
        experiment_code TEXT,
        name TEXT,
        dataset_id TEXT,
        status TEXT DEFAULT 'pending',
        task_type TEXT DEFAULT '',
        model_family TEXT DEFAULT '',
        params_snapshot_json TEXT DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
      , dataset_code TEXT, dataset_version TEXT, template_id TEXT, template_code TEXT, task_id TEXT, config_json TEXT DEFAULT '{}', metrics_json TEXT DEFAULT '{}', command_text TEXT, work_dir TEXT, output_dir TEXT, checkpoint_path TEXT, report_path TEXT, notes TEXT, started_at TEXT, finished_at TEXT, execution_mode TEXT DEFAULT '', preflight_status TEXT DEFAULT '', config_snapshot_path TEXT DEFAULT '', env_snapshot_path TEXT DEFAULT '', resume_used INTEGER DEFAULT 0, final_device TEXT DEFAULT '', eval_manifest_path TEXT DEFAULT '', badcases_manifest_path TEXT DEFAULT '', hardcases_manifest_path TEXT DEFAULT '');

-- table: failure_signatures
CREATE TABLE IF NOT EXISTS failure_signatures (
        id TEXT PRIMARY KEY,
        signature_hash TEXT NOT NULL UNIQUE,
        step_key TEXT NOT NULL,
        error_type TEXT NOT NULL,
        message_fingerprint TEXT DEFAULT '',
        context_json TEXT DEFAULT '{}',
        hit_count INTEGER NOT NULL DEFAULT 1,
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: feedback_batches
CREATE TABLE IF NOT EXISTS feedback_batches (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'evaluation',
        source_id TEXT DEFAULT '',
        trigger_type TEXT NOT NULL DEFAULT 'failed_case',
        status TEXT NOT NULL DEFAULT 'draft',
        item_count INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: feedback_items
CREATE TABLE IF NOT EXISTS feedback_items (
        id TEXT PRIMARY KEY,
        batch_id TEXT NOT NULL,
        file_path TEXT DEFAULT '',
        label_json TEXT DEFAULT '{}',
        reason TEXT DEFAULT '',
        confidence REAL DEFAULT 0,
        source_task_id TEXT DEFAULT '',
        source_model_id TEXT DEFAULT '',
        source_dataset_id TEXT DEFAULT '',
        predicted_label TEXT DEFAULT '',
        ground_truth TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_at TEXT DEFAULT '',
        reviewed_by TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );

-- table: frame_cleanings
CREATE TABLE IF NOT EXISTS frame_cleanings (
        id TEXT PRIMARY KEY,
        frame_extraction_id TEXT,
        cleaned_output_dir TEXT,
        raw_count INTEGER,
        cleaned_count INTEGER,
        dropped_count INTEGER,
        cleaning_config_json TEXT,
        created_at TEXT,
        updated_at TEXT
      );

-- table: frame_extractions
CREATE TABLE IF NOT EXISTS frame_extractions (
        id TEXT PRIMARY KEY,
        video_batch_id TEXT,
        extraction_config_json TEXT,
        total_frames INTEGER,
        output_path TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        updated_at TEXT
      );

-- table: gate_checks
CREATE TABLE IF NOT EXISTS gate_checks (
      id TEXT PRIMARY KEY,
      gate_name TEXT NOT NULL,
      stage_name TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      status TEXT NOT NULL,
      check_results_json TEXT NOT NULL DEFAULT '[]',
      fail_reasons_json TEXT DEFAULT '[]',
      pass_result TEXT DEFAULT '',
      audit_record TEXT DEFAULT '',
      blocking_status TEXT DEFAULT '',
      checked_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

-- table: incident_actions
CREATE TABLE IF NOT EXISTS incident_actions (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        from_status TEXT NOT NULL DEFAULT '',
        to_status TEXT NOT NULL DEFAULT '',
        comment TEXT NOT NULL DEFAULT '',
        actor TEXT NOT NULL DEFAULT 'system',
        meta_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );

-- table: incident_playbook_runs
CREATE TABLE IF NOT EXISTS incident_playbook_runs (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        playbook_id TEXT NOT NULL,
        playbook_code TEXT NOT NULL,
        run_status TEXT NOT NULL DEFAULT 'not_started',
        current_step_index INTEGER NOT NULL DEFAULT 0,
        total_steps INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL DEFAULT '',
        completed_at TEXT NOT NULL DEFAULT '',
        aborted_at TEXT NOT NULL DEFAULT '',
        result_note TEXT NOT NULL DEFAULT '',
        actor TEXT NOT NULL DEFAULT 'system',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , review_summary_json TEXT NOT NULL DEFAULT "{}", backflow_json TEXT NOT NULL DEFAULT "{}");

-- table: incident_playbook_steps
CREATE TABLE IF NOT EXISTS incident_playbook_steps (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        incident_id TEXT NOT NULL,
        playbook_id TEXT NOT NULL,
        step_index INTEGER NOT NULL,
        action_type TEXT NOT NULL DEFAULT 'step_note',
        action_note TEXT NOT NULL DEFAULT '',
        actor TEXT NOT NULL DEFAULT 'system',
        created_at TEXT NOT NULL
      );

-- table: incident_playbooks
CREATE TABLE IF NOT EXISTS incident_playbooks (
        id TEXT PRIMARY KEY,
        playbook_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        applies_to_source_type TEXT NOT NULL DEFAULT '',
        applies_to_severity TEXT NOT NULL DEFAULT '*',
        applies_to_pattern TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        precheck_json TEXT NOT NULL DEFAULT '[]',
        steps_json TEXT NOT NULL DEFAULT '[]',
        risk_notes_json TEXT NOT NULL DEFAULT '[]',
        rollback_notes_json TEXT NOT NULL DEFAULT '[]',
        acceptance_json TEXT NOT NULL DEFAULT '[]',
        enabled INTEGER NOT NULL DEFAULT 1,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , status TEXT NOT NULL DEFAULT "active", quality_score REAL NOT NULL DEFAULT 0, effectiveness_score REAL NOT NULL DEFAULT 0, last_evaluated_at TEXT NOT NULL DEFAULT "", needs_revision INTEGER NOT NULL DEFAULT 0, assistant_playbook_evidence_json TEXT NOT NULL DEFAULT "{}", playbook_improvement_hint TEXT NOT NULL DEFAULT "", playbook_needs_revision_assistant_hint INTEGER NOT NULL DEFAULT 0);

-- table: incidents
CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        source_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        assignee TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        probable_cause TEXT NOT NULL DEFAULT '',
        resolution_summary TEXT NOT NULL DEFAULT '',
        recommended_actions_json TEXT NOT NULL DEFAULT '[]',
        evidence_refs_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , playbook_id TEXT NOT NULL DEFAULT '', playbook_code TEXT NOT NULL DEFAULT '', playbook_match_reason TEXT NOT NULL DEFAULT '', playbook_run_status TEXT NOT NULL DEFAULT 'not_started', playbook_step_completed INTEGER NOT NULL DEFAULT 0, playbook_step_total INTEGER NOT NULL DEFAULT 0, assistant_diagnosis_summary TEXT NOT NULL DEFAULT '', assistant_probable_cause TEXT NOT NULL DEFAULT '', assistant_recommended_actions_json TEXT NOT NULL DEFAULT '[]', assistant_confidence REAL NOT NULL DEFAULT 0, assistant_risk_level TEXT NOT NULL DEFAULT '', assistant_manual_confirmation_required INTEGER NOT NULL DEFAULT 0, assistant_last_request_id TEXT NOT NULL DEFAULT '', assistant_last_status TEXT NOT NULL DEFAULT '');

-- table: job_logs
CREATE TABLE IF NOT EXISTS job_logs (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        step_id TEXT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(job_id) REFERENCES workflow_jobs(id)
      );

-- table: job_steps
CREATE TABLE IF NOT EXISTS job_steps (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        step_key TEXT NOT NULL,
        step_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        input_json TEXT,
        output_json TEXT,
        error_message TEXT,
        started_at TEXT,
        finished_at TEXT,
        duration_ms INTEGER,
        retry_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL, last_error_summary TEXT DEFAULT '', resumable INTEGER DEFAULT 1, can_retry INTEGER DEFAULT 1, resumed_from_step TEXT DEFAULT '', resumed_at TEXT DEFAULT '', skipped_reason TEXT DEFAULT '',
        FOREIGN KEY(job_id) REFERENCES workflow_jobs(id)
      );

-- table: knowledge_entries
CREATE TABLE IF NOT EXISTS knowledge_entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general_note',
        source_type TEXT DEFAULT 'general',
        source_id TEXT DEFAULT '',
        summary TEXT DEFAULT '',
        problem TEXT DEFAULT '',
        resolution TEXT DEFAULT '',
        conclusion TEXT DEFAULT '',
        recommendation TEXT DEFAULT '',
        tags_json TEXT DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

-- table: knowledge_links
CREATE TABLE IF NOT EXISTS knowledge_links (
        id TEXT PRIMARY KEY,
        knowledge_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relation_type TEXT NOT NULL DEFAULT 'relates_to',
        created_at TEXT NOT NULL
    );

-- table: learned_rules
CREATE TABLE IF NOT EXISTS learned_rules (
        id TEXT PRIMARY KEY,
        rule_code TEXT NOT NULL UNIQUE,
        scope TEXT NOT NULL,
        trigger_json TEXT NOT NULL DEFAULT '{}',
        action_json TEXT NOT NULL DEFAULT '{}',
        mode TEXT NOT NULL DEFAULT 'suggest',
        approval_required INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        confidence REAL NOT NULL DEFAULT 0.0,
        version INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , status TEXT NOT NULL DEFAULT "active", quality_score REAL NOT NULL DEFAULT 0, candidate_level TEXT NOT NULL DEFAULT "none", last_evaluated_at TEXT DEFAULT "", promotion_requested_at TEXT DEFAULT "", promotion_reviewed_at TEXT DEFAULT "", promotion_reviewed_by TEXT DEFAULT "", last_matched_at TEXT DEFAULT "", assistant_evidence_json TEXT NOT NULL DEFAULT "{}", assistant_adoption_rate REAL NOT NULL DEFAULT 0, cloud_helpful INTEGER NOT NULL DEFAULT 0);

-- table: model_package_artifacts
CREATE TABLE IF NOT EXISTS model_package_artifacts (
        id TEXT PRIMARY KEY,
        package_id TEXT NOT NULL,
        artifact_id TEXT NOT NULL,
        artifact_role TEXT DEFAULT 'primary',
        relative_path TEXT DEFAULT '',
        checksum TEXT DEFAULT '',
        file_size_bytes INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );

-- table: model_packages
CREATE TABLE IF NOT EXISTS model_packages (
        id TEXT PRIMARY KEY,
        model_id TEXT NOT NULL,
        package_name TEXT NOT NULL,
        package_version TEXT NOT NULL DEFAULT '1.0.0',
        status TEXT NOT NULL DEFAULT 'draft',
        artifact_ids_json TEXT DEFAULT '[]',
        manifest_json TEXT DEFAULT '{}',
        release_note TEXT DEFAULT '',
        storage_path TEXT DEFAULT '',
        file_size_bytes INTEGER DEFAULT 0,
        checksum TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: models
CREATE TABLE IF NOT EXISTS models (
        model_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT,
        source_experiment_id TEXT,
        latest_evaluation_id TEXT,
        task_type TEXT DEFAULT '',
        model_family TEXT DEFAULT '',
        artifact_path TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT
      , promotion_status TEXT NOT NULL DEFAULT 'draft', source_artifact_id TEXT DEFAULT '', promotion_comment TEXT DEFAULT '', sealed_at TEXT DEFAULT '', sealed_by TEXT DEFAULT '', release_id TEXT DEFAULT '', gate_status TEXT DEFAULT '', evaluation_id TEXT DEFAULT '', artifact_id TEXT DEFAULT '', dataset_version_id TEXT DEFAULT '', training_run_id TEXT DEFAULT '', release_note_json TEXT DEFAULT '{}', status TEXT DEFAULT 'draft', approved_by TEXT, approved_at TEXT, approval_note TEXT, shadow_validation_id TEXT, shadow_compare_report_json TEXT, rollback_target_id TEXT, last_production_model_id TEXT, production_gate_status TEXT DEFAULT 'pending', production_gate_checks_json TEXT);

-- table: negative_pools
CREATE TABLE IF NOT EXISTS negative_pools (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT NOT NULL,
        pool_version TEXT NOT NULL,
        rejection_reason TEXT DEFAULT '',
        source_batch_type TEXT DEFAULT '',
        source_batch_id TEXT DEFAULT '',
        sample_identifier TEXT NOT NULL,
        label_data TEXT DEFAULT '{}',
        rejection_metadata TEXT DEFAULT '{}',
        reused_count INTEGER DEFAULT 0,
        last_reused_at TEXT,
        created_at TEXT NOT NULL, badcase_type TEXT, source_image_id TEXT, source_box_json TEXT, reviewed_by TEXT, reviewed_at TEXT, reuse_count INTEGER DEFAULT 0,
        FOREIGN KEY(dataset_version_id) REFERENCES dataset_versions(id)
      );

-- table: openclaw_config
CREATE TABLE IF NOT EXISTS openclaw_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT ''
    );

-- table: openclaw_control
CREATE TABLE IF NOT EXISTS openclaw_control (
      id TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0,
      init_failed INTEGER NOT NULL DEFAULT 0,
      error_reason TEXT DEFAULT '',
      circuit_state TEXT NOT NULL DEFAULT 'normal',
      runtime_online INTEGER NOT NULL DEFAULT 1,
      circuit_fail_count INTEGER NOT NULL DEFAULT 0,
      circuit_fail_threshold INTEGER NOT NULL DEFAULT 3,
      timeout_window_count INTEGER NOT NULL DEFAULT 0,
      timeout_threshold INTEGER NOT NULL DEFAULT 5,
      high_risk_auto_disable INTEGER NOT NULL DEFAULT 1,
      auto_circuit_reserved INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL
    , auto_cancel_queued_on_disable INTEGER NOT NULL DEFAULT 0, last_heartbeat_at TEXT DEFAULT '', heartbeat_timeout_sec INTEGER NOT NULL DEFAULT 30, queued_cancel_scope TEXT DEFAULT '', queued_cancel_tenant_id TEXT DEFAULT '', queued_cancel_project_id TEXT DEFAULT '', queued_cancel_run_group TEXT DEFAULT '', queued_cancel_scope_json TEXT NOT NULL DEFAULT '{}');

-- table: openclaw_control_events
CREATE TABLE IF NOT EXISTS openclaw_control_events (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT DEFAULT '',
      snapshot_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL
    );

-- table: patch_sets
CREATE TABLE IF NOT EXISTS patch_sets (
        patch_set_id TEXT PRIMARY KEY,
        name TEXT,
        patch_type TEXT NOT NULL DEFAULT 'badcases',
        status TEXT NOT NULL DEFAULT 'draft',
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_evaluation_id TEXT,
        source_dataset_id TEXT,
        source_dataset_version TEXT,
        manifest_path TEXT DEFAULT '',
        sample_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );

-- table: playbook_feedback
CREATE TABLE IF NOT EXISTS playbook_feedback (
        id TEXT PRIMARY KEY,
        playbook_id TEXT NOT NULL,
        incident_id TEXT NOT NULL,
        run_id TEXT NOT NULL,
        feedback_type TEXT NOT NULL,
        comment TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL DEFAULT 'operator',
        created_at TEXT NOT NULL
      );

-- table: plugin_audit_logs
CREATE TABLE IF NOT EXISTS plugin_audit_logs (
  -- 主键
  audit_id TEXT PRIMARY KEY,
  
  -- 核心关联
  plugin_id TEXT NOT NULL,
  plugin_name TEXT,
  plugin_version TEXT,
  
  -- 事件分类
  action TEXT NOT NULL,           -- 动作: discover, register, enable, disable, execute, rollback, status_change
  event_type TEXT NOT NULL,       -- 事件类型: lifecycle, execution, gate, system
  
  -- 状态/结果
  status TEXT NOT NULL,           -- 状态: success, failed, blocked, pending, rolled_back
  result_code TEXT,               -- 结果码: 成功/失败的具体代码
  
  -- 执行上下文
  actor TEXT,                     -- 执行者: user_id, system, cron, etc.
  request_id TEXT,                -- 请求追踪 ID，可与 audit_logs 关联
  trace_id TEXT,                  -- 分布式追踪 ID
  session_id TEXT,                -- 会话 ID
  
  -- 输入输出摘要
  input_summary TEXT,             -- 输入参数摘要（脱敏）
  output_summary TEXT,            -- 输出结果摘要（脱敏）
  
  -- 错误信息
  error_type TEXT,                -- 错误类型
  error_message TEXT,             -- 错误消息
  error_stack TEXT,               -- 错误堆栈（可选）
  
  -- 执行环境
  execution_mode TEXT,            -- readonly, side_effect, resource_intensive
  dry_run INTEGER DEFAULT 0,      -- 是否试运行
  plugin_status TEXT,             -- 插件当前状态
  risk_level TEXT,                -- 风险级别
  
  -- 性能指标
  duration_ms INTEGER,            -- 执行耗时
  memory_usage_kb INTEGER,        -- 内存使用
  
  -- 审计元数据
  client_ip TEXT,                 -- 客户端 IP
  user_agent TEXT,                -- 用户代理
  metadata_json TEXT,             -- 扩展元数据（JSON）
  
  -- 时间戳
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- table: plugin_events
CREATE TABLE IF NOT EXISTS plugin_events (
        id TEXT PRIMARY KEY,
        plugin_id TEXT NOT NULL,
        plugin_name TEXT NOT NULL,
        action TEXT NOT NULL,
        before_status TEXT NOT NULL,
        after_status TEXT NOT NULL,
        reason TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );

-- table: plugin_init_runs
CREATE TABLE IF NOT EXISTS plugin_init_runs (
        id TEXT PRIMARY KEY,
        init_status TEXT NOT NULL,
        plugin_system_enabled INTEGER NOT NULL DEFAULT 1,
        plugin_system_active INTEGER NOT NULL DEFAULT 0,
        discovered_count INTEGER NOT NULL DEFAULT 0,
        success_count INTEGER NOT NULL DEFAULT 0,
        failed_count INTEGER NOT NULL DEFAULT 0,
        error_summary TEXT DEFAULT '',
        started_at TEXT NOT NULL,
        finished_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

-- table: plugin_registry
CREATE TABLE IF NOT EXISTS plugin_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 基础标识
  plugin_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  
  -- Layer 1: 治理必需字段
  category TEXT NOT NULL DEFAULT 'legacy/unknown',
  status TEXT NOT NULL DEFAULT 'frozen' CHECK (status IN ('active', 'gated', 'trial', 'frozen', 'planned', 'residual')),
  execution_mode TEXT NOT NULL DEFAULT 'readonly' CHECK (execution_mode IN ('readonly', 'side_effect', 'resource_intensive')),
  requires_approval INTEGER NOT NULL DEFAULT 0,
  dry_run_supported INTEGER NOT NULL DEFAULT 0,
  
  -- Layer 2: 画布节点字段 (JSON 存储)
  ui_node_type TEXT CHECK (ui_node_type IN ('source', 'transform', 'sink', 'control')),
  allowed_upstream TEXT,  -- JSON array
  allowed_downstream TEXT,  -- JSON array
  input_schema TEXT,  -- JSON Schema
  output_schema TEXT,  -- JSON Schema
  
  -- Layer 3: UI 展示字段
  icon TEXT,
  color TEXT,
  documentation_url TEXT,
  
  -- Layer 0: 基础字段
  entry TEXT NOT NULL DEFAULT './index.js',
  capabilities TEXT NOT NULL DEFAULT '["read"]',  -- JSON array
  permissions TEXT,  -- JSON array
  risk_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  config_schema TEXT,  -- JSON
  enabled INTEGER NOT NULL DEFAULT 1,
  author TEXT,
  description TEXT,
  tags TEXT,  -- JSON array
  
  -- 完整 manifest 备份
  manifest_json TEXT NOT NULL DEFAULT '{}',
  
  -- 元数据
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  
  -- 状态追踪
  status_changed_at TEXT,
  status_changed_reason TEXT
);

-- table: plugin_status_history
CREATE TABLE IF NOT EXISTS plugin_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  operator TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (plugin_id) REFERENCES "plugin_registry_old"(plugin_id) ON DELETE CASCADE
);

-- table: production_badcases
CREATE TABLE IF NOT EXISTS production_badcases (
          id TEXT PRIMARY KEY,
          model_id TEXT,
          observation_id TEXT,
          badcase_type TEXT,
          frame_id TEXT,
          severity TEXT,
          description TEXT,
          metadata_json TEXT,
          status TEXT DEFAULT 'pending',
          created_at TEXT,
          updated_at TEXT
        );

-- table: production_observations
CREATE TABLE IF NOT EXISTS production_observations (
          id TEXT PRIMARY KEY,
          model_id TEXT,
          observation_period_start TEXT,
          observation_period_end TEXT,
          inference_count INTEGER DEFAULT 0,
          ui_misdetect_count INTEGER DEFAULT 0,
          missed_detection_count INTEGER DEFAULT 0,
          classifier_reject_count INTEGER DEFAULT 0,
          review_pack_pressure REAL DEFAULT 0,
          badcase_count INTEGER DEFAULT 0,
          notes TEXT,
          created_at TEXT,
          updated_at TEXT
        );

-- table: recovery_logs
CREATE TABLE IF NOT EXISTS recovery_logs (
      id TEXT PRIMARY KEY,
      recovery_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      status TEXT NOT NULL,
      source_backup TEXT DEFAULT '',
      source_release TEXT DEFAULT '',
      verification_json TEXT DEFAULT '{}',
      notes TEXT DEFAULT '',
      performed_by TEXT DEFAULT '',
      performed_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

-- table: releases
CREATE TABLE IF NOT EXISTS releases (
      id TEXT PRIMARY KEY,
      artifact_id TEXT NOT NULL,
      model_id TEXT DEFAULT '',
      release_name TEXT NOT NULL,
      release_version TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'sealed',
      sealed_by TEXT DEFAULT '',
      sealed_at TEXT NOT NULL,
      release_notes TEXT DEFAULT '',
      release_manifest_json TEXT DEFAULT '{}',
      source_evaluation_id TEXT DEFAULT '',
      source_experiment_id TEXT DEFAULT '',
      source_dataset_id TEXT DEFAULT '',
      metrics_snapshot_json TEXT DEFAULT '{}',
      approval_id TEXT DEFAULT '',
      approval_status TEXT DEFAULT '',
      package_present INTEGER DEFAULT 0,
      backup_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

-- table: review_pack_items
CREATE TABLE IF NOT EXISTS review_pack_items (
          id TEXT PRIMARY KEY,
          review_pack_id TEXT,
          badcase_id TEXT,
          frame_id TEXT,
          badcase_type TEXT,
          severity TEXT,
          description TEXT,
          metadata_json TEXT,
          review_decision TEXT,
          reviewer_notes TEXT,
          created_at TEXT,
          updated_at TEXT
        );

-- table: review_packs
CREATE TABLE IF NOT EXISTS review_packs (
        id TEXT PRIMARY KEY,
        dataset_version_id TEXT,
        pack_type TEXT DEFAULT 'human_review',
        total_samples INTEGER,
        reviewed_samples INTEGER DEFAULT 0,
        approved_samples INTEGER DEFAULT 0,
        rejected_samples INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        reviewer_assignee TEXT,
        created_at TEXT,
        updated_at TEXT
      );

-- table: rollback_points
CREATE TABLE IF NOT EXISTS rollback_points (
        id TEXT PRIMARY KEY,
        deployment_id TEXT NOT NULL,
        from_revision_id TEXT NOT NULL,
        to_revision_id TEXT NOT NULL,
        reason TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        rolled_back_at TEXT,
        created_at TEXT NOT NULL
      );

-- table: route_decisions
CREATE TABLE IF NOT EXISTS route_decisions (
        id TEXT PRIMARY KEY,
        task_id TEXT DEFAULT '',
        task_type TEXT NOT NULL,
        policy_id TEXT DEFAULT '',
        route_type TEXT NOT NULL,
        route_reason TEXT NOT NULL,
        input_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL
      );

-- table: route_policies
CREATE TABLE IF NOT EXISTS route_policies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        task_type TEXT NOT NULL,
        route_type TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 100,
        status TEXT NOT NULL DEFAULT 'active',
        reason_template TEXT DEFAULT '',
        metadata_json TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: rule_engine_runs
CREATE TABLE IF NOT EXISTS rule_engine_runs (
        rule_run_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_tracker_run_id TEXT,
        source_verification_id TEXT,
        source_segmentation_id TEXT,
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        total_decisions INTEGER DEFAULT 0,
        affected_tracks INTEGER DEFAULT 0,
        unstable_class_count INTEGER DEFAULT 0,
        low_confidence_count INTEGER DEFAULT 0,
        transient_count INTEGER DEFAULT 0,
        conflict_count INTEGER DEFAULT 0,
        ended_resolved_count INTEGER DEFAULT 0,
        rule_config_json TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT
      );

-- table: rule_feedback
CREATE TABLE IF NOT EXISTS rule_feedback (
        id TEXT PRIMARY KEY,
        rule_id TEXT NOT NULL,
        job_id TEXT DEFAULT '',
        step_id TEXT DEFAULT '',
        feedback_type TEXT NOT NULL,
        comment TEXT DEFAULT '',
        created_by TEXT DEFAULT 'operator',
        created_at TEXT NOT NULL
      );

-- table: run_artifacts
CREATE TABLE IF NOT EXISTS run_artifacts (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        artifact_id TEXT DEFAULT '',
        relation_type TEXT DEFAULT 'output'
      );

-- table: run_logs
CREATE TABLE IF NOT EXISTS run_logs (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        step_id TEXT DEFAULT '',
        log_level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

-- table: run_steps
CREATE TABLE IF NOT EXISTS run_steps (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        step_key TEXT NOT NULL,
        step_name TEXT NOT NULL,
        step_order INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        started_at TEXT,
        finished_at TEXT,
        duration_ms INTEGER DEFAULT 0,
        input_json TEXT DEFAULT '{}',
        output_json TEXT DEFAULT '{}',
        error_message TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: runs
CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        run_code TEXT NOT NULL,
        name TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'manual',
        source_id TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'queued',
        priority INTEGER DEFAULT 5,
        trigger_mode TEXT DEFAULT 'manual',
        executor_type TEXT DEFAULT 'mock',
        workspace_path TEXT DEFAULT '',
        config_json TEXT DEFAULT '{}',
        summary_json TEXT DEFAULT '{}',
        error_message TEXT DEFAULT '',
        started_at TEXT,
        finished_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      , dataset_version_id TEXT DEFAULT '', execution_mode TEXT DEFAULT 'standard', yolo_config_json TEXT DEFAULT '{}', env_snapshot_json TEXT DEFAULT '{}', exit_code INTEGER DEFAULT 0, tenant_id TEXT DEFAULT '', project_id TEXT DEFAULT '', run_group TEXT DEFAULT '');

-- table: sam_handoffs
CREATE TABLE IF NOT EXISTS sam_handoffs (
        handoff_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        source_dataset_version TEXT,
        manifest_path TEXT DEFAULT '',
        roi_count INTEGER DEFAULT 0,
        prompt_count INTEGER DEFAULT 0,
        prompt_type TEXT DEFAULT 'box',
        total_detections INTEGER DEFAULT 0,
        avg_confidence REAL DEFAULT 0,
        unique_classes INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      );

-- table: sam_segmentations
CREATE TABLE IF NOT EXISTS sam_segmentations (
        segmentation_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        model_type TEXT DEFAULT 'vit_b',
        checkpoint_path TEXT DEFAULT '',
        prompt_count INTEGER DEFAULT 0,
        mask_count INTEGER DEFAULT 0,
        avg_mask_score REAL DEFAULT 0,
        avg_coverage REAL DEFAULT 0,
        total_infer_time_s REAL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      , classifier_verification_id TEXT);

-- table: schema_migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      migration_type TEXT NOT NULL DEFAULT 'index',
      target_name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      applied_at TEXT NOT NULL
    , checksum TEXT NOT NULL DEFAULT '');

-- table: shadow_validations
CREATE TABLE IF NOT EXISTS shadow_validations (
        id TEXT PRIMARY KEY,
        candidate_model_id TEXT,
        baseline_model_id TEXT,
        test_video_batch_id TEXT,
        status TEXT DEFAULT 'pending',
        candidate_metrics_json TEXT,
        baseline_metrics_json TEXT,
        compare_result_json TEXT,
        false_positive_diff INTEGER,
        false_negative_diff INTEGER,
        classifier_reject_diff INTEGER,
        review_pack_pressure_diff REAL,
        badcases_json TEXT,
        recommendation TEXT,
        created_at TEXT,
        updated_at TEXT
      , config_json TEXT);

-- table: task_logs
CREATE TABLE IF NOT EXISTS task_logs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        step_id TEXT,
        level TEXT NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

-- table: task_reflections
CREATE TABLE IF NOT EXISTS task_reflections (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        template_id TEXT DEFAULT '',
        status TEXT NOT NULL,
        what_failed TEXT DEFAULT '',
        what_worked TEXT DEFAULT '',
        root_cause TEXT DEFAULT '',
        wrong_assumption TEXT DEFAULT '',
        fix_applied TEXT DEFAULT '',
        evidence_json TEXT DEFAULT '{}',
        next_time_rule_draft TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: task_steps
CREATE TABLE IF NOT EXISTS task_steps (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        step_name TEXT NOT NULL,
        step_type TEXT DEFAULT '',
        step_index INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        started_at TEXT,
        finished_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: tasks
CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      template_id TEXT,
      template_code TEXT,
      template_version TEXT,
      owner TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      started_at TEXT,
      finished_at TEXT,
      source_task_id TEXT,
      input_payload TEXT,
      output_summary TEXT,
      error_message TEXT
    );

-- table: templates
CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        version TEXT NOT NULL DEFAULT '1.0.0',
        status TEXT NOT NULL DEFAULT 'active',
        description TEXT,
        definition_json TEXT,
        input_schema_json TEXT,
        default_input_json TEXT,
        workflow_steps_json TEXT,
        is_builtin INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: tracker_runs
CREATE TABLE IF NOT EXISTS tracker_runs (
        tracker_run_id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        source_verification_id TEXT,
        source_segmentation_id TEXT,
        source_handoff_id TEXT,
        source_experiment_id TEXT,
        source_model_id TEXT,
        source_dataset_id TEXT,
        manifest_path TEXT DEFAULT '',
        total_tracks INTEGER DEFAULT 0,
        total_frames INTEGER DEFAULT 0,
        avg_track_length REAL DEFAULT 0,
        active_count INTEGER DEFAULT 0,
        ended_count INTEGER DEFAULT 0,
        iou_threshold REAL DEFAULT 0.3,
        dist_threshold REAL DEFAULT 80.0,
        tracking_config_json TEXT DEFAULT '',
        created_at TEXT,
        updated_at TEXT
      );

-- table: training_checkpoints
CREATE TABLE IF NOT EXISTS training_checkpoints (
        id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        step INTEGER DEFAULT 0,
        epoch INTEGER DEFAULT 0,
        checkpoint_path TEXT DEFAULT '',
        metrics_json TEXT DEFAULT '{}',
        is_best INTEGER DEFAULT 0,
        is_latest INTEGER DEFAULT 1,
        file_size_bytes INTEGER,
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: training_configs
CREATE TABLE IF NOT EXISTS training_configs (
        id TEXT PRIMARY KEY,
        config_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        model_name TEXT DEFAULT '',
        dataset_id TEXT DEFAULT '',
        config_json TEXT DEFAULT '{}',
        params_json TEXT DEFAULT '{}',
        resource_json TEXT DEFAULT '{}',
        is_builtin INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

-- table: video_batches
CREATE TABLE IF NOT EXISTS video_batches (
        id TEXT PRIMARY KEY,
        batch_code TEXT NOT NULL,
        source_type TEXT DEFAULT 'upload',
        source_url TEXT,
        total_frames INTEGER,
        duration_seconds INTEGER,
        resolution TEXT,
        fps REAL,
        status TEXT DEFAULT 'pending',
        metadata_json TEXT,
        created_at TEXT,
        updated_at TEXT
      );

-- table: workflow_jobs
CREATE TABLE IF NOT EXISTS workflow_jobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        template_id TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        current_step_index INTEGER DEFAULT 0,
        input_json TEXT,
        output_summary_json TEXT,
        error_message TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        finished_at TEXT
      , blocked_reason TEXT, last_error TEXT, resumed_at TEXT, resumed_by TEXT, cancelled_at TEXT, cancelled_by TEXT, retried_at TEXT, retried_by TEXT, retry_count INTEGER DEFAULT 0, retry_limit INTEGER DEFAULT 3, cancel_requested_at TEXT, cancel_requested_by TEXT, reconciled_at TEXT, reconciled_by TEXT, execution_scope TEXT DEFAULT 'full', start_step TEXT DEFAULT '', end_step TEXT DEFAULT '', skip_steps_json TEXT DEFAULT '[]', resume_pointer TEXT DEFAULT '', control_version INTEGER DEFAULT 1);

-- table: yolo_annotations
CREATE TABLE IF NOT EXISTS yolo_annotations (
        id TEXT PRIMARY KEY,
        frame_extraction_id TEXT,
        model_id TEXT,
        annotation_data_json TEXT,
        total_boxes INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TEXT,
        updated_at TEXT
      );

-- Core schema indexes (split from baseline)
-- Generated at: 2026-04-24T00:00:06.266Z

-- index: idx_adr_created
CREATE INDEX IF NOT EXISTS idx_adr_created ON assistant_diagnostic_requests(created_at);

-- index: idx_adr_incident
CREATE INDEX IF NOT EXISTS idx_adr_incident ON assistant_diagnostic_requests(incident_id);

-- index: idx_adr_status
CREATE INDEX IF NOT EXISTS idx_adr_status ON assistant_diagnostic_requests(status);

-- index: idx_al_action
CREATE INDEX IF NOT EXISTS idx_al_action ON audit_logs(action);

-- index: idx_al_category
CREATE INDEX IF NOT EXISTS idx_al_category ON audit_logs(category);

-- index: idx_al_created
CREATE INDEX IF NOT EXISTS idx_al_created ON audit_logs(created_at);

-- index: idx_al_target
CREATE INDEX IF NOT EXISTS idx_al_target ON audit_logs(target);

-- index: idx_appr_resource
CREATE INDEX IF NOT EXISTS idx_appr_resource ON approvals(resource_type, resource_id);

-- index: idx_appr_status
CREATE INDEX IF NOT EXISTS idx_appr_status ON approvals(status);

-- index: idx_appr_step
CREATE INDEX IF NOT EXISTS idx_appr_step ON approvals(step_id);

-- index: idx_approvals_expires
CREATE INDEX IF NOT EXISTS idx_approvals_expires ON approvals(expires_at);

-- index: idx_approvals_policy
CREATE INDEX IF NOT EXISTS idx_approvals_policy ON approvals(policy_type);

-- index: idx_approvals_resource
CREATE INDEX IF NOT EXISTS idx_approvals_resource ON approvals(resource_type, resource_id);

-- index: idx_approvals_status
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

-- index: idx_approvals_step
CREATE INDEX IF NOT EXISTS idx_approvals_step ON approvals(step_id);

-- index: idx_audit_logs_category_action_created
CREATE INDEX IF NOT EXISTS idx_audit_logs_category_action_created ON audit_logs(category, action, datetime(created_at) DESC);

-- index: idx_audit_logs_dry_run
CREATE INDEX IF NOT EXISTS idx_audit_logs_dry_run ON audit_logs(dry_run);

-- index: idx_audit_logs_plugin_status
CREATE INDEX IF NOT EXISTS idx_audit_logs_plugin_status ON audit_logs(plugin_status);

-- index: idx_cv_artifact
CREATE INDEX IF NOT EXISTS idx_cv_artifact ON classifier_verifications(artifact_id);

-- index: idx_cv_experiment
CREATE INDEX IF NOT EXISTS idx_cv_experiment ON classifier_verifications(source_experiment_id);

-- index: idx_cv_handoff
CREATE INDEX IF NOT EXISTS idx_cv_handoff ON classifier_verifications(source_handoff_id);

-- index: idx_cv_segmentation
CREATE INDEX IF NOT EXISTS idx_cv_segmentation ON classifier_verifications(source_segmentation_id);

-- index: idx_cv_status
CREATE INDEX IF NOT EXISTS idx_cv_status ON classifier_verifications(status);

-- index: idx_deplogs_deployment
CREATE INDEX IF NOT EXISTS idx_deplogs_deployment ON deployment_logs(deployment_id);

-- index: idx_deployments_artifact
CREATE INDEX IF NOT EXISTS idx_deployments_artifact ON deployments(artifact_id);

-- index: idx_deployments_status
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);

-- index: idx_deployments_training
CREATE INDEX IF NOT EXISTS idx_deployments_training ON deployments(training_job_id);

-- index: idx_dpr_dataset
CREATE INDEX IF NOT EXISTS idx_dpr_dataset ON dataset_pipeline_runs(dataset_id);

-- index: idx_dpr_run
CREATE INDEX IF NOT EXISTS idx_dpr_run ON dataset_pipeline_runs(run_id);

-- index: idx_dr_deployment
CREATE INDEX IF NOT EXISTS idx_dr_deployment ON deployment_revisions(deployment_id);

-- index: idx_dr_package
CREATE INDEX IF NOT EXISTS idx_dr_package ON deployment_revisions(package_id);

-- index: idx_dr_status
CREATE INDEX IF NOT EXISTS idx_dr_status ON deployment_revisions(status);

-- index: idx_ds_dataset
CREATE INDEX IF NOT EXISTS idx_ds_dataset ON dataset_splits(dataset_id);

-- index: idx_ds_pipeline
CREATE INDEX IF NOT EXISTS idx_ds_pipeline ON dataset_splits(dataset_pipeline_run_id);

-- index: idx_dt_status
CREATE INDEX IF NOT EXISTS idx_dt_status ON deployment_targets(status);

-- index: idx_dt_type
CREATE INDEX IF NOT EXISTS idx_dt_type ON deployment_targets(target_type);

-- index: idx_dv_dataset
CREATE INDEX IF NOT EXISTS idx_dv_dataset ON dataset_versions(dataset_id);

-- index: idx_dv_status
CREATE INDEX IF NOT EXISTS idx_dv_status ON dataset_versions(status);

-- index: idx_dv_version
CREATE INDEX IF NOT EXISTS idx_dv_version ON dataset_versions(version);

-- index: idx_dva_status
CREATE INDEX IF NOT EXISTS idx_dva_status ON dataset_version_approvals(approval_status);

-- index: idx_dva_version
CREATE INDEX IF NOT EXISTS idx_dva_version ON dataset_version_approvals(dataset_version_id);

-- index: idx_dvb_type
CREATE INDEX IF NOT EXISTS idx_dvb_type ON dataset_version_batches(batch_type);

-- index: idx_dvb_version
CREATE INDEX IF NOT EXISTS idx_dvb_version ON dataset_version_batches(dataset_version_id);

-- index: idx_ep_cluster
CREATE UNIQUE INDEX IF NOT EXISTS idx_ep_cluster ON error_patterns(step_key, error_type, message_fingerprint);

-- index: idx_ep_error_type
CREATE INDEX IF NOT EXISTS idx_ep_error_type ON error_patterns(error_type);

-- index: idx_ep_last_seen
CREATE INDEX IF NOT EXISTS idx_ep_last_seen ON error_patterns(last_seen_at);

-- index: idx_ep_step
CREATE INDEX IF NOT EXISTS idx_ep_step ON error_patterns(step_key);

-- index: idx_eval_artifact
CREATE INDEX IF NOT EXISTS idx_eval_artifact ON evaluations(artifact_id);

-- index: idx_eval_dataset_version
CREATE INDEX IF NOT EXISTS idx_eval_dataset_version ON evaluations(dataset_version_id);

-- index: idx_fb_source
CREATE INDEX IF NOT EXISTS idx_fb_source ON feedback_batches(source_type, source_id);

-- index: idx_fb_status
CREATE INDEX IF NOT EXISTS idx_fb_status ON feedback_batches(status);

-- index: idx_fb_trigger
CREATE INDEX IF NOT EXISTS idx_fb_trigger ON feedback_batches(trigger_type);

-- index: idx_fi_batch
CREATE INDEX IF NOT EXISTS idx_fi_batch ON feedback_items(batch_id);

-- index: idx_fi_model
CREATE INDEX IF NOT EXISTS idx_fi_model ON feedback_items(source_model_id);

-- index: idx_fi_status
CREATE INDEX IF NOT EXISTS idx_fi_status ON feedback_items(status);

-- index: idx_frame_cleaning_fe
CREATE INDEX IF NOT EXISTS idx_frame_cleaning_fe ON frame_cleanings(frame_extraction_id);

-- index: idx_frame_extraction_video
CREATE INDEX IF NOT EXISTS idx_frame_extraction_video ON frame_extractions(video_batch_id);

-- index: idx_fs_error_type
CREATE INDEX IF NOT EXISTS idx_fs_error_type ON failure_signatures(error_type);

-- index: idx_fs_last_seen
CREATE INDEX IF NOT EXISTS idx_fs_last_seen ON failure_signatures(last_seen_at);

-- index: idx_fs_step
CREATE INDEX IF NOT EXISTS idx_fs_step ON failure_signatures(step_key);

-- index: idx_gate_checks_status_checked
CREATE INDEX IF NOT EXISTS idx_gate_checks_status_checked ON gate_checks(status, datetime(checked_at) DESC);

-- index: idx_ia_action
CREATE INDEX IF NOT EXISTS idx_ia_action ON incident_actions(action_type);

-- index: idx_ia_created
CREATE INDEX IF NOT EXISTS idx_ia_created ON incident_actions(created_at);

-- index: idx_ia_incident
CREATE INDEX IF NOT EXISTS idx_ia_incident ON incident_actions(incident_id);

-- index: idx_inc_assignee
CREATE INDEX IF NOT EXISTS idx_inc_assignee ON incidents(assignee);

-- index: idx_inc_severity
CREATE INDEX IF NOT EXISTS idx_inc_severity ON incidents(severity);

-- index: idx_inc_source
CREATE INDEX IF NOT EXISTS idx_inc_source ON incidents(source_type, source_id);

-- index: idx_inc_status
CREATE INDEX IF NOT EXISTS idx_inc_status ON incidents(status);

-- index: idx_inc_updated
CREATE INDEX IF NOT EXISTS idx_inc_updated ON incidents(updated_at);

-- index: idx_ipb_enabled
CREATE INDEX IF NOT EXISTS idx_ipb_enabled ON incident_playbooks(enabled);

-- index: idx_ipb_needs_revision
CREATE INDEX IF NOT EXISTS idx_ipb_needs_revision ON incident_playbooks(needs_revision);

-- index: idx_ipb_source
CREATE INDEX IF NOT EXISTS idx_ipb_source ON incident_playbooks(applies_to_source_type);

-- index: idx_ipr_incident
CREATE INDEX IF NOT EXISTS idx_ipr_incident ON incident_playbook_runs(incident_id);

-- index: idx_ipr_status
CREATE INDEX IF NOT EXISTS idx_ipr_status ON incident_playbook_runs(run_status);

-- index: idx_ips_incident
CREATE INDEX IF NOT EXISTS idx_ips_incident ON incident_playbook_steps(incident_id);

-- index: idx_ips_run
CREATE INDEX IF NOT EXISTS idx_ips_run ON incident_playbook_steps(run_id);

-- index: idx_ips_step
CREATE INDEX IF NOT EXISTS idx_ips_step ON incident_playbook_steps(step_index);

-- index: idx_jl_job
CREATE INDEX IF NOT EXISTS idx_jl_job ON job_logs(job_id);

-- index: idx_js_job
CREATE INDEX IF NOT EXISTS idx_js_job ON job_steps(job_id);

-- index: idx_js_status
CREATE INDEX IF NOT EXISTS idx_js_status ON job_steps(status);

-- index: idx_ke_category
CREATE INDEX IF NOT EXISTS idx_ke_category ON knowledge_entries(category);

-- index: idx_ke_created
CREATE INDEX IF NOT EXISTS idx_ke_created ON knowledge_entries(created_at);

-- index: idx_ke_source
CREATE INDEX IF NOT EXISTS idx_ke_source ON knowledge_entries(source_type, source_id);

-- index: idx_kl_kid
CREATE INDEX IF NOT EXISTS idx_kl_kid ON knowledge_links(knowledge_id);

-- index: idx_kl_target
CREATE INDEX IF NOT EXISTS idx_kl_target ON knowledge_links(target_type, target_id);

-- index: idx_lr_candidate
CREATE INDEX IF NOT EXISTS idx_lr_candidate ON learned_rules(candidate_level);

-- index: idx_lr_confidence
CREATE INDEX IF NOT EXISTS idx_lr_confidence ON learned_rules(confidence);

-- index: idx_lr_enabled
CREATE INDEX IF NOT EXISTS idx_lr_enabled ON learned_rules(enabled);

-- index: idx_lr_mode
CREATE INDEX IF NOT EXISTS idx_lr_mode ON learned_rules(mode);

-- index: idx_lr_scope
CREATE INDEX IF NOT EXISTS idx_lr_scope ON learned_rules(scope);

-- index: idx_lr_status
CREATE INDEX IF NOT EXISTS idx_lr_status ON learned_rules(status);

-- index: idx_model_artifact
CREATE INDEX IF NOT EXISTS idx_model_artifact ON models(artifact_id);

-- index: idx_model_evaluation
CREATE INDEX IF NOT EXISTS idx_model_evaluation ON models(evaluation_id);

-- index: idx_mp_model
CREATE INDEX IF NOT EXISTS idx_mp_model ON model_packages(model_id);

-- index: idx_mp_status
CREATE INDEX IF NOT EXISTS idx_mp_status ON model_packages(status);

-- index: idx_mpa_artifact
CREATE INDEX IF NOT EXISTS idx_mpa_artifact ON model_package_artifacts(artifact_id);

-- index: idx_mpa_package
CREATE INDEX IF NOT EXISTS idx_mpa_package ON model_package_artifacts(package_id);

-- index: idx_np_reason
CREATE INDEX IF NOT EXISTS idx_np_reason ON negative_pools(rejection_reason);

-- index: idx_np_sample
CREATE INDEX IF NOT EXISTS idx_np_sample ON negative_pools(sample_identifier);

-- index: idx_np_version
CREATE INDEX IF NOT EXISTS idx_np_version ON negative_pools(pool_version);

-- index: idx_pbf_created
CREATE INDEX IF NOT EXISTS idx_pbf_created ON playbook_feedback(created_at);

-- index: idx_pbf_feedback_type
CREATE INDEX IF NOT EXISTS idx_pbf_feedback_type ON playbook_feedback(feedback_type);

-- index: idx_pbf_playbook
CREATE INDEX IF NOT EXISTS idx_pbf_playbook ON playbook_feedback(playbook_id);

-- index: idx_pe_action
CREATE INDEX IF NOT EXISTS idx_pe_action ON plugin_events(action);

-- index: idx_pe_created
CREATE INDEX IF NOT EXISTS idx_pe_created ON plugin_events(created_at);

-- index: idx_pe_plugin
CREATE INDEX IF NOT EXISTS idx_pe_plugin ON plugin_events(plugin_id);

-- index: idx_pir_created
CREATE INDEX IF NOT EXISTS idx_pir_created ON plugin_init_runs(created_at);

-- index: idx_pir_status
CREATE INDEX IF NOT EXISTS idx_pir_status ON plugin_init_runs(init_status);

-- index: idx_plugin_audit_action
CREATE INDEX IF NOT EXISTS idx_plugin_audit_action ON plugin_audit_logs(action);

-- index: idx_plugin_audit_action_time
CREATE INDEX IF NOT EXISTS idx_plugin_audit_action_time ON plugin_audit_logs(action, created_at);

-- index: idx_plugin_audit_created_at
CREATE INDEX IF NOT EXISTS idx_plugin_audit_created_at ON plugin_audit_logs(created_at);

-- index: idx_plugin_audit_event_type
CREATE INDEX IF NOT EXISTS idx_plugin_audit_event_type ON plugin_audit_logs(event_type);

-- index: idx_plugin_audit_logs_plugin_created
CREATE INDEX IF NOT EXISTS idx_plugin_audit_logs_plugin_created ON plugin_audit_logs(plugin_id, datetime(created_at) DESC);

-- index: idx_plugin_audit_plugin_id
CREATE INDEX IF NOT EXISTS idx_plugin_audit_plugin_id ON plugin_audit_logs(plugin_id);

-- index: idx_plugin_audit_plugin_time
CREATE INDEX IF NOT EXISTS idx_plugin_audit_plugin_time ON plugin_audit_logs(plugin_id, created_at);

-- index: idx_plugin_audit_request_id
CREATE INDEX IF NOT EXISTS idx_plugin_audit_request_id ON plugin_audit_logs(request_id);

-- index: idx_plugin_audit_status
CREATE INDEX IF NOT EXISTS idx_plugin_audit_status ON plugin_audit_logs(status);

-- index: idx_plugin_audit_trace_id
CREATE INDEX IF NOT EXISTS idx_plugin_audit_trace_id ON plugin_audit_logs(trace_id);

-- index: idx_plugin_registry_category
CREATE INDEX IF NOT EXISTS idx_plugin_registry_category ON plugin_registry(category);

-- index: idx_plugin_registry_risk_level
CREATE INDEX IF NOT EXISTS idx_plugin_registry_risk_level ON plugin_registry(risk_level);

-- index: idx_plugin_registry_status
CREATE INDEX IF NOT EXISTS idx_plugin_registry_status ON plugin_registry(status);

-- index: idx_plugin_registry_ui_node_type
CREATE INDEX IF NOT EXISTS idx_plugin_registry_ui_node_type ON plugin_registry(ui_node_type);

-- index: idx_pr_updated
CREATE INDEX IF NOT EXISTS idx_pr_updated ON plugin_registry(updated_at);

-- index: idx_ps_dataset
CREATE INDEX IF NOT EXISTS idx_ps_dataset ON patch_sets(source_dataset_id);

-- index: idx_ps_experiment
CREATE INDEX IF NOT EXISTS idx_ps_experiment ON patch_sets(source_experiment_id);

-- index: idx_ps_model
CREATE INDEX IF NOT EXISTS idx_ps_model ON patch_sets(source_model_id);

-- index: idx_rd_created
CREATE INDEX IF NOT EXISTS idx_rd_created ON route_decisions(created_at);

-- index: idx_rd_route_type
CREATE INDEX IF NOT EXISTS idx_rd_route_type ON route_decisions(route_type);

-- index: idx_rd_task_type
CREATE INDEX IF NOT EXISTS idx_rd_task_type ON route_decisions(task_type);

-- index: idx_re_exp
CREATE INDEX IF NOT EXISTS idx_re_exp ON rule_engine_runs(source_experiment_id);

-- index: idx_re_status
CREATE INDEX IF NOT EXISTS idx_re_status ON rule_engine_runs(status);

-- index: idx_re_tr
CREATE INDEX IF NOT EXISTS idx_re_tr ON rule_engine_runs(source_tracker_run_id);

-- index: idx_recovery_logs_type_performed
CREATE INDEX IF NOT EXISTS idx_recovery_logs_type_performed ON recovery_logs(recovery_type, datetime(performed_at) DESC);

-- index: idx_review_pack_dataset
CREATE INDEX IF NOT EXISTS idx_review_pack_dataset ON review_packs(dataset_version_id);

-- index: idx_rf_created
CREATE INDEX IF NOT EXISTS idx_rf_created ON rule_feedback(created_at);

-- index: idx_rf_rule
CREATE INDEX IF NOT EXISTS idx_rf_rule ON rule_feedback(rule_id);

-- index: idx_rf_type
CREATE INDEX IF NOT EXISTS idx_rf_type ON rule_feedback(feedback_type);

-- index: idx_rp_deployment
CREATE INDEX IF NOT EXISTS idx_rp_deployment ON rollback_points(deployment_id);

-- index: idx_rp_priority
CREATE INDEX IF NOT EXISTS idx_rp_priority ON route_policies(priority);

-- index: idx_rp_route_type
CREATE INDEX IF NOT EXISTS idx_rp_route_type ON route_policies(route_type);

-- index: idx_rp_status
CREATE INDEX IF NOT EXISTS idx_rp_status ON rollback_points(status);

-- index: idx_rp_task_type
CREATE INDEX IF NOT EXISTS idx_rp_task_type ON route_policies(task_type);

-- index: idx_runartifacts_run
CREATE INDEX IF NOT EXISTS idx_runartifacts_run ON run_artifacts(run_id);

-- index: idx_runlogs_run
CREATE INDEX IF NOT EXISTS idx_runlogs_run ON run_logs(run_id);

-- index: idx_runs_dataset_version
CREATE INDEX IF NOT EXISTS idx_runs_dataset_version ON runs(dataset_version_id);

-- index: idx_runs_executor_status_updated
CREATE INDEX IF NOT EXISTS idx_runs_executor_status_updated ON runs(executor_type, status, datetime(updated_at) DESC);

-- index: idx_runs_executor_updated
CREATE INDEX IF NOT EXISTS idx_runs_executor_updated ON runs(executor_type, datetime(updated_at) DESC);

-- index: idx_runs_scope
CREATE INDEX IF NOT EXISTS idx_runs_scope ON runs(tenant_id, project_id, run_group);

-- index: idx_runs_source
CREATE INDEX IF NOT EXISTS idx_runs_source ON runs(source_type, source_id);

-- index: idx_runs_status
CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);

-- index: idx_runsteps_run
CREATE INDEX IF NOT EXISTS idx_runsteps_run ON run_steps(run_id);

-- index: idx_sh_dataset
CREATE INDEX IF NOT EXISTS idx_sh_dataset ON sam_handoffs(source_dataset_id);

-- index: idx_sh_experiment
CREATE INDEX IF NOT EXISTS idx_sh_experiment ON sam_handoffs(source_experiment_id);

-- index: idx_sh_model
CREATE INDEX IF NOT EXISTS idx_sh_model ON sam_handoffs(source_model_id);

-- index: idx_ss_experiment
CREATE INDEX IF NOT EXISTS idx_ss_experiment ON sam_segmentations(source_experiment_id);

-- index: idx_ss_handoff
CREATE INDEX IF NOT EXISTS idx_ss_handoff ON sam_segmentations(source_handoff_id);

-- index: idx_ss_model
CREATE INDEX IF NOT EXISTS idx_ss_model ON sam_segmentations(source_model_id);

-- index: idx_ss_status
CREATE INDEX IF NOT EXISTS idx_ss_status ON sam_segmentations(status);

-- index: idx_status_history_created_at
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON plugin_status_history(created_at);

-- index: idx_status_history_plugin_id
CREATE INDEX IF NOT EXISTS idx_status_history_plugin_id ON plugin_status_history(plugin_id);

-- index: idx_sv_baseline
CREATE INDEX IF NOT EXISTS idx_sv_baseline ON shadow_validations(baseline_model_id);

-- index: idx_sv_candidate
CREATE INDEX IF NOT EXISTS idx_sv_candidate ON shadow_validations(candidate_model_id);

-- index: idx_task_logs_task
CREATE INDEX IF NOT EXISTS idx_task_logs_task ON task_logs(task_id);

-- index: idx_task_logs_task_time
CREATE INDEX IF NOT EXISTS idx_task_logs_task_time ON task_logs(task_id, created_at);

-- index: idx_task_steps_task
CREATE INDEX IF NOT EXISTS idx_task_steps_task ON task_steps(task_id);

-- index: idx_task_steps_task_idx
CREATE INDEX IF NOT EXISTS idx_task_steps_task_idx ON task_steps(task_id, step_index);

-- index: idx_tc_epoch
CREATE INDEX IF NOT EXISTS idx_tc_epoch ON training_checkpoints(epoch);

-- index: idx_tc_run
CREATE INDEX IF NOT EXISTS idx_tc_run ON training_checkpoints(run_id);

-- index: idx_templates_category
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- index: idx_templates_code
CREATE INDEX IF NOT EXISTS idx_templates_code ON templates(code);

-- index: idx_tr_created
CREATE INDEX IF NOT EXISTS idx_tr_created ON task_reflections(created_at);

-- index: idx_tr_experiment
CREATE INDEX IF NOT EXISTS idx_tr_experiment ON tracker_runs(source_experiment_id);

-- index: idx_tr_job
CREATE INDEX IF NOT EXISTS idx_tr_job ON task_reflections(job_id);

-- index: idx_tr_segmentation
CREATE INDEX IF NOT EXISTS idx_tr_segmentation ON tracker_runs(source_segmentation_id);

-- index: idx_tr_status
CREATE INDEX IF NOT EXISTS idx_tr_status ON tracker_runs(status);

-- index: idx_tr_template
CREATE INDEX IF NOT EXISTS idx_tr_template ON task_reflections(template_id);

-- index: idx_tr_verification
CREATE INDEX IF NOT EXISTS idx_tr_verification ON tracker_runs(source_verification_id);

-- index: idx_training_configs_code
CREATE INDEX IF NOT EXISTS idx_training_configs_code ON training_configs(config_code);

-- index: idx_video_batch_status
CREATE INDEX IF NOT EXISTS idx_video_batch_status ON video_batches(status);

-- index: idx_wj_status
CREATE INDEX IF NOT EXISTS idx_wj_status ON workflow_jobs(status);

-- index: idx_wj_template
CREATE INDEX IF NOT EXISTS idx_wj_template ON workflow_jobs(template_id);

-- index: idx_workflow_jobs_status_updated
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_status_updated ON workflow_jobs(status, datetime(updated_at) DESC);

-- index: idx_yolo_annotation_frame
CREATE INDEX IF NOT EXISTS idx_yolo_annotation_frame ON yolo_annotations(frame_extraction_id);

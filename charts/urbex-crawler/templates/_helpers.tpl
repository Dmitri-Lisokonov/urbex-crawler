{{/*
Expand the name of the chart.
*/}}
{{- define "urbex.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Common labels used in all resources.
*/}}
{{- define "urbex.labels" -}}
app.kubernetes.io/name: {{ include "urbex.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Pod-specific labels.
*/}}
{{- define "urbex.podLabels" -}}
{{ include "urbex.labels" . }}
app.kubernetes.io/component: {{ .Values.component | quote }}
app.kubernetes.io/part-of: "urbex-crawler"
{{- end }}

{{/*
Stringify and render a map as YAML key: "value" pairs (for metadata.labels)
*/}}
{{- define "urbex.quotedLabels" -}}
{{- range $k, $v := . }}
{{ $k }}: {{ $v | quote }}
{{- end }}
{{- end }}
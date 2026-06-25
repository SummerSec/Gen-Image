$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
  Write-Error "Current directory is not a git repository."
}

if (-not (Test-Path "external")) {
  New-Item -ItemType Directory -Path "external" | Out-Null
}

if (-not (Test-Path "external/awesome-gpt-image-2")) {
  git submodule add --force https://github.com/freestylefly/awesome-gpt-image-2 external/awesome-gpt-image-2
}

if (-not (Test-Path "external/awesome-gpt-image-2-api-prompts")) {
  git submodule add --force https://github.com/mageia/awesome-gpt-image-2-API-and-Prompts external/awesome-gpt-image-2-api-prompts
}

git submodule update --init --remote --recursive

Write-Host "Submodules initialized. Run: npm run sync:prompts"

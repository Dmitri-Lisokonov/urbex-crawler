$ErrorActionPreference = 'Stop'

try {
    # Define paths relative to current working directory
    $urbexUiPath = "urbex-ui"
    $urbexServicePath = "Urbex.Service"

    # Verify paths exist
    if (!(Test-Path $urbexUiPath)) {
        throw "Path not found: $urbexUiPath"
    }
    if (!(Test-Path $urbexServicePath)) {
        throw "Path not found: $urbexServicePath"
    }

    # Define image names
    $urbexUiImage = "homelab.local/urbex-ui"
    $urbexServiceImage = "homelab.local/urbex-service"

    # Define output tar files
    $urbexUiTar = "urbex-ui.tar"
    $urbexServiceTar = "urbex-service.tar"

    Write-Host "Building urbex-ui image..."
    docker build -t $urbexUiImage $urbexUiPath

    Write-Host "Building urbex-service image..."
    docker build -t $urbexServiceImage $urbexServicePath

    Write-Host "Saving urbex-ui image to tar..."
    docker save $urbexUiImage -o $urbexUiTar

    Write-Host "Saving urbex-service image to tar..."
    docker save $urbexServiceImage -o $urbexServiceTar

    Write-Host "Copying urbex-ui.tar to remote..."
    scp $urbexUiTar dmitri@192.168.1.3:/home/dmitri

    Write-Host "Copying urbex-service.tar to remote..."
    scp $urbexServiceTar dmitri@192.168.1.3:/home/dmitri

    Write-Host "All tasks completed successfully."
}
catch {
    Write-Error "Aborted due to error: $($_.Exception.Message)"
    exit 1
}

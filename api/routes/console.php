<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Create the vehicle-photo bucket if it does not exist (local S3 service or a
| fresh AWS bucket). Safe to run repeatedly.
*/
Artisan::command('storage:ensure-bucket', function () {
    $disk = config('filesystems.vehicle_images_disk');
    $bucket = config("filesystems.disks.{$disk}.bucket");
    $client = Storage::disk($disk)->getClient();

    if ($client->doesBucketExistV2($bucket)) {
        $this->info("Bucket [{$bucket}] already exists.");

        return;
    }
    $client->createBucket(['Bucket' => $bucket]);
    $this->info("Created bucket [{$bucket}].");
})->purpose('Create the S3 bucket used for vehicle photos');

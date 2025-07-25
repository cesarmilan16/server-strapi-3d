module.exports = ({ env }) => ({
    // ...
    upload: {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          s3Options: {
            credentials: {
              accessKeyId: "AKIA4SYAMIADMF52HLED",
              secretAccessKey: env('AWS_ACCESS_SECRET'),
            },
            region: "eu-west-1",
            params: {
              ACL: env('AWS_ACL', 'public-read'),
              signedUrlExpires: env('AWS_SIGNED_URL_EXPIRES', 15 * 60),
              Bucket: "ecommerce-3d",
            },
          },
        },
      },
    },
  });

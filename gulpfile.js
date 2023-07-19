const gulp = require("gulp");

// tasks
require("./gulp/dev");
require("./gulp/docs");

gulp.task(
  "default",
  gulp.series(
    "clean:dev",
    gulp.parallel(
      "html:dev",
      "sass:dev",
      "images:dev",
      "fonts:dev",
      "files:dev",
      "scripts:dev"
    ),
    gulp.parallel("watch:dev", "server:dev")
  )
);

gulp.task(
  "docs",
  gulp.series(
    "clean:docs",
    gulp.parallel(
      "html:docs",
      "sass:docs",
      "images:docs",
      "fonts:docs",
      "files:docs",
      "scripts:docs"
    ),
    gulp.parallel( "server:docs")
  )
);

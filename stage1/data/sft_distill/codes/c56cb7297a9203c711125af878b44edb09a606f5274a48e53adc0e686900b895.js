const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 记录已生成的三角形数量
  let triangleCount = 0;
  const maxTriangles = 3;

  // 创建定时器事件，每4秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 4000, // 4秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true
  });

  function spawnTriangle() {
    // 检查是否已达到最大数量
    if (triangleCount >= maxTriangles) {
      timerEvent.remove(); // 停止定时器
      return;
    }

    // 生成随机位置
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);

    // 使用 Graphics 绘制白色三角形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1); // 白色

    // 绘制三角形（等边三角形）
    const size = 40;
    graphics.fillTriangle(
      0, -size,           // 顶点
      -size, size,        // 左下角
      size, size          // 右下角
    );

    // 设置位置
    graphics.setPosition(x, y);

    // 增加计数
    triangleCount++;

    console.log(`生成第 ${triangleCount} 个三角形，位置: (${x}, ${y})`);
  }
}

new Phaser.Game(config);
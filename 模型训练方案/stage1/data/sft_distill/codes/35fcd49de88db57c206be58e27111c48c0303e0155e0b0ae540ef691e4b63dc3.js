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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  
  // 绘制三角形（三个顶点坐标）
  // 中心点在 (25, 25)，三角形向上
  graphics.fillTriangle(
    25, 10,  // 顶点（上）
    10, 40,  // 左下顶点
    40, 40   // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用该纹理的 Sprite
  const triangle = this.add.sprite(100, 300, 'triangleTexture');
  
  // 创建补间动画：从左移动到右，1秒完成，往返循环
  this.tweens.add({
    targets: triangle,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 持续时间 1 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达终点后返回起点）
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);
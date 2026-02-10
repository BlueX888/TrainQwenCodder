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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（等边三角形，中心点在原点）
  const triangleSize = 50;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize / 2); // 顶点
  graphics.lineTo(-triangleSize / 2, triangleSize / 2); // 左下角
  graphics.lineTo(triangleSize / 2, triangleSize / 2); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('pinkTriangle', triangleSize, triangleSize);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形精灵，初始位置在左侧
  const leftX = 100;
  const rightX = 700;
  const centerY = 300;
  
  const triangle = this.add.sprite(leftX, centerY, 'pinkTriangle');
  
  // 创建补间动画：从左到右移动，往返循环
  this.tweens.add({
    targets: triangle,
    x: rightX, // 目标 x 坐标（右侧）
    duration: 500, // 持续时间 0.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达终点后返回起点）
    loop: -1 // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);
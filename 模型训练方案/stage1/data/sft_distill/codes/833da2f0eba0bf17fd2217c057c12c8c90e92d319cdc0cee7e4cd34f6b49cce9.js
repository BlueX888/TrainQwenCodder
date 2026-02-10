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
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充颜色
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（以中心为原点）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-25, 30);     // 左下角
  graphics.lineTo(25, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('pinkTriangle', 50, 60);
  graphics.destroy(); // 销毁 Graphics 对象，只保留纹理
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'pinkTriangle');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 4000,            // 持续时间 4 秒
    yoyo: true,                // 往返效果（到达终点后反向回到起点）
    repeat: -1,                // 无限循环
    ease: 'Linear'             // 线性缓动，保持匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '粉色三角形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);
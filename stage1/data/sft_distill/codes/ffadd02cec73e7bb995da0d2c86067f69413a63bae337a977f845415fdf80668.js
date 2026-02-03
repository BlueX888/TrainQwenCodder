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
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（中心点在原点）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-25, 30);     // 左下角
  graphics.lineTo(25, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('pinkTriangle', 50, 60);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'pinkTriangle');
  
  // 创建补间动画
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 4000,              // 持续时间 4 秒
    yoyo: true,                  // 往返效果（到达终点后反向播放）
    repeat: -1,                  // 无限循环（-1 表示永久重复）
    ease: 'Linear'               // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '粉色三角形往返循环移动', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  // 创建粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(0, 0, 60, 40); // 在原点绘制椭圆，宽60高40
  
  // 将 graphics 转换为纹理以便用于精灵
  graphics.generateTexture('pinkEllipse', 60, 40);
  graphics.destroy(); // 销毁临时 graphics 对象
  
  // 创建椭圆精灵，初始位置在左侧
  const ellipse = this.add.sprite(100, 300, 'pinkEllipse');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: ellipse,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 持续时间 1 秒
    yoyo: true, // 启用往返效果（到达目标后反向播放）
    repeat: -1, // 无限循环（-1 表示永久重复）
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);
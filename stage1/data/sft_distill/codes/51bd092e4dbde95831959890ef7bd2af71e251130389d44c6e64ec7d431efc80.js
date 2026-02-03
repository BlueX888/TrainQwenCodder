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
  // 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 80, 60); // 绘制80x60的矩形
  graphics.generateTexture('yellowRect', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建黄色矩形精灵
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: rect,
    x: 700, // 目标x坐标（右侧）
    duration: 4000, // 4秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达终点后反向回到起点）
    loop: -1, // 无限循环（-1表示永久循环）
    repeat: 0 // yoyo模式下repeat设为0，循环由loop控制
  });
  
  // 添加说明文字
  this.add.text(400, 50, '黄色矩形4秒往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
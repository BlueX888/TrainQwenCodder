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
  // 使用 Graphics 绘制粉色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(0, 0, 30); // 在原点绘制半径为30的圆
  
  // 生成纹理以便用于精灵
  graphics.generateTexture('pinkCircle', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已生成纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'pinkCircle');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: circle,
    x: 700, // 目标 x 坐标（从100移动到700）
    duration: 4000, // 持续时间4秒
    yoyo: true, // 启用往返效果（到达终点后反向回到起点）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);
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
  // 使用 Graphics 绘制绿色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  
  // 生成纹理
  graphics.generateTexture('greenCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象，初始位置在左侧
  const circle = this.add.sprite(100, 300, 'greenCircle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: circle,
    x: 700, // 目标 x 坐标（右侧）
    duration: 1000, // 持续时间 1 秒
    yoyo: true, // 启用往返效果（到达目标后反向播放）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);
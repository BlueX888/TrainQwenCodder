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
  // 创建红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillCircle(0, 0, 30); // 在中心绘制半径为30的圆形
  
  // 生成纹理以便用于精灵
  graphics.generateTexture('redCircle', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'redCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,        // 动画目标
    x: 700,                 // 目标 x 坐标（从左100移动到右700）
    duration: 2500,         // 持续时间 2.5 秒
    ease: 'Linear',         // 线性缓动
    yoyo: true,             // 往返效果（到达终点后反向播放）
    repeat: -1              // 无限循环（-1 表示永远重复）
  });
}

// 启动游戏
new Phaser.Game(config);
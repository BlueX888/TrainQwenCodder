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
  // 创建 Graphics 对象绘制红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色，不透明
  graphics.fillCircle(0, 0, 30); // 在原点绘制半径为30的圆形
  
  // 将 graphics 转换为纹理，方便后续操作
  graphics.generateTexture('redCircle', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建使用该纹理的精灵，初始位置在左侧
  const circle = this.add.sprite(100, 300, 'redCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,        // 动画目标对象
    x: 700,                 // 目标 x 坐标（右侧）
    duration: 2500,         // 持续时间 2.5 秒（2500 毫秒）
    ease: 'Linear',         // 线性缓动
    yoyo: true,             // 启用往返效果（到达终点后反向播放）
    repeat: -1              // 无限循环（-1 表示永久重复）
  });
}

// 启动 Phaser 游戏
new Phaser.Game(config);
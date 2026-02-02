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
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  
  // 生成纹理
  graphics.generateTexture('blueCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成
  
  // 创建使用该纹理的精灵
  const circle = this.add.sprite(100, 300, 'blueCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,        // 动画目标对象
    x: 700,                 // 目标 x 坐标（从左侧100移动到右侧700）
    duration: 500,          // 持续时间 500 毫秒（0.5秒）
    yoyo: true,             // 启用往返效果（到达目标后反向播放）
    repeat: -1,             // 无限循环（-1 表示永久重复）
    ease: 'Linear'          // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);
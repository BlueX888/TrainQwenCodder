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
  // 使用 Graphics 绘制红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  
  // 生成纹理
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'redCircle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: circle,
    x: 700, // 目标 x 坐标（右侧位置）
    duration: 2500, // 持续时间 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达目标后反向播放）
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(10, 10, '红色圆形左右往返循环移动', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

// 创建游戏实例
new Phaser.Game(config);
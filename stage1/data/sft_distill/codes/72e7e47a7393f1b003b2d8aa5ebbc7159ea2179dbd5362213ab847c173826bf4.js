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
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(25, 25, 25); // 绘制半径为25的圆形
  
  // 生成纹理
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建圆形精灵，初始位置在左侧
  const circle = this.add.sprite(100, 300, 'circle');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: circle,
    x: 700, // 目标 x 位置（右侧）
    duration: 500, // 持续时间 0.5 秒
    yoyo: true, // 启用往返效果
    repeat: -1, // 无限循环（-1 表示永久重复）
    ease: 'Linear' // 线性缓动
  });
}

// 创建游戏实例
new Phaser.Game(config);
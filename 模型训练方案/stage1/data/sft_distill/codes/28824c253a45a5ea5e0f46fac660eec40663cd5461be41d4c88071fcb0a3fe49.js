const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('pinkSquare', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象并居中显示
  const square = this.add.sprite(400, 300, 'pinkSquare');
  
  // 创建淡入淡出动画
  this.tweens.add({
    targets: square,
    alpha: 0, // 目标透明度为 0（完全透明）
    duration: 500, // 持续时间 0.5 秒
    yoyo: true, // 启用 yoyo 效果，动画结束后反向播放（实现淡入）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
}

new Phaser.Game(config);
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
  // 使用 Graphics 绘制一个方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建 Sprite 对象并居中显示
  const square = this.add.sprite(400, 300, 'square');
  
  // 设置初始透明度为 0（完全透明）
  square.alpha = 0;
  
  // 创建补间动画：从透明到不透明，持续 4 秒，循环播放
  this.tweens.add({
    targets: square,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 4000,            // 持续时间 4000 毫秒（4秒）
    ease: 'Linear',            // 线性缓动函数
    repeat: -1,                // -1 表示无限循环
    yoyo: false                // 不使用往返效果，只从 0 到 1 循环
  });
  
  // 添加文字提示
  this.add.text(400, 500, '方块正在从透明渐变到不透明（循环播放）', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
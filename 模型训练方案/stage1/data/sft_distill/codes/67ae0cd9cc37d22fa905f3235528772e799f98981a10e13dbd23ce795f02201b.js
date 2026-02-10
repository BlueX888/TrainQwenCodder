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
  // 使用 Graphics 绘制白色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1); // 白色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的方块
  
  // 生成纹理
  graphics.generateTexture('whiteSquare', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，放置在左侧起始位置
  const square = this.add.sprite(100, 300, 'whiteSquare');
  
  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: square,        // 动画目标对象
    x: 700,                 // 目标 x 坐标（右侧位置）
    duration: 2000,         // 持续时间 2 秒
    yoyo: true,             // 启用往返效果（到达终点后反向播放）
    repeat: -1,             // 无限循环（-1 表示永久重复）
    ease: 'Linear'          // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'White square moving left-right with yoyo loop', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
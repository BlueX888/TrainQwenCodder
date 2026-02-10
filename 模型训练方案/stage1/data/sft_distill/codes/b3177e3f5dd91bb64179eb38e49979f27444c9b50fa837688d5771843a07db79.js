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
  // 使用 Graphics 生成红色矩形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 60, 60);
  graphics.generateTexture('redRect', 60, 60);
  graphics.destroy();
}

function create() {
  // 创建红色矩形精灵，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'redRect');
  
  // 创建补间动画：从左到右移动，3秒完成，往返循环
  this.tweens.add({
    targets: rect,
    x: 700, // 目标 x 坐标（右侧）
    duration: 3000, // 3 秒
    yoyo: true, // 启用往返效果（到达目标后反向播放）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
  
  // 添加文字说明
  this.add.text(10, 10, 'Red rectangle moving left-right in 3 seconds loop', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
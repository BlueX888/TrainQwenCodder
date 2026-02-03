const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 80, 60);
  graphics.generateTexture('whiteRect', 80, 60);
  graphics.destroy();
  
  // 创建矩形精灵，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'whiteRect');
  
  // 创建补间动画：从左到右移动，往返循环
  this.tweens.add({
    targets: rect,
    x: 700, // 目标位置（右侧）
    duration: 3000, // 3秒
    yoyo: true, // 启用往返效果（到达目标后反向播放）
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动，匀速移动
  });
  
  // 添加文本说明
  this.add.text(10, 10, 'White rectangle moving left-right in 3s loop', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
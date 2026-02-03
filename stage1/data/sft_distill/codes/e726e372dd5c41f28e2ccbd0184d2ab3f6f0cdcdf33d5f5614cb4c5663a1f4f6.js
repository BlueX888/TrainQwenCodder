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
  // 使用 Graphics 绘制红色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 80, 60);
  
  // 生成纹理
  graphics.generateTexture('redRect', 80, 60);
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'redRect');
  
  // 创建补间动画：从左到右移动，3秒往返循环
  this.tweens.add({
    targets: rect,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 3000,            // 持续时间 3 秒
    yoyo: true,                // 启用往返效果（到达目标后反向播放）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    ease: 'Linear'             // 线性缓动函数，匀速移动
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Red rectangle moving left-right in 3s loop', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
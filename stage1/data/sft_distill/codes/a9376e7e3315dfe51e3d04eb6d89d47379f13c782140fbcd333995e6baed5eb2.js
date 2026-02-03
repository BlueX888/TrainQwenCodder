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
  // 使用 Graphics 绘制黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 40); // 绘制 60x40 的矩形
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，节省资源
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标
    x: 700,                  // 移动到右侧（800 - 100 = 700）
    duration: 1000,          // 持续时间 1 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 往返效果（到达终点后反向播放）
    loop: -1,                // 无限循环（-1 表示永久循环）
    repeat: 0                // yoyo 模式下不需要额外的 repeat
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Yellow Rectangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The rectangle moves left to right and loops forever', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);
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
  // 1. 使用 Graphics 绘制红色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillRect(0, 0, 60, 60); // 60x60 的矩形
  
  // 2. 生成纹理
  graphics.generateTexture('redRect', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 3. 创建 Sprite 对象，初始位置在左侧
  const startX = 100;
  const endX = 700;
  const centerY = 300;
  
  const rect = this.add.sprite(startX, centerY, 'redRect');
  
  // 4. 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标
    x: endX,                 // 目标 x 坐标（从左到右）
    duration: 3000,          // 持续时间 3 秒
    yoyo: true,              // 往返效果（到达终点后返回起点）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Linear'           // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Red Rectangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '3 seconds loop with yoyo effect', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);
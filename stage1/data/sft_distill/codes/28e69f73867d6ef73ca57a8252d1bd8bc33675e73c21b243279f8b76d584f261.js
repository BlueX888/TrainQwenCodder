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
  // 使用 Graphics 创建红色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillRect(0, 0, 80, 60); // 绘制 80x60 的矩形
  
  // 生成纹理
  graphics.generateTexture('redRect', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'redRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 3000,          // 持续时间 3 秒
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Linear'           // 线性缓动函数，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Red Rectangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The rectangle moves left-right in 3 seconds loop', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);
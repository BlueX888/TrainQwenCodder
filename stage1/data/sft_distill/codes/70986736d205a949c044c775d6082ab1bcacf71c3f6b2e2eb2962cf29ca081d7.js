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
  // 使用 Graphics 绘制白色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 50, 50);
  
  // 生成纹理
  graphics.generateTexture('whiteSquare', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建方块图像，初始位置在左侧
  const square = this.add.image(100, 300, 'whiteSquare');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: square,           // 动画目标对象
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 2000,            // 持续时间 2 秒
    yoyo: true,                // 启用往返效果（到达目标后反向播放）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    ease: 'Linear'             // 线性缓动函数，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'White Square Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The square moves left-right in a loop', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
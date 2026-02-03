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
  // 使用 Graphics 绘制蓝色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 80, 60); // 绘制矩形
  
  // 生成纹理
  graphics.generateTexture('blueRect', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象
  const rect = this.add.sprite(100, 300, 'blueRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧位置）
    duration: 4000,          // 单程持续时间 4 秒
    yoyo: true,              // 启用往返效果（到达目标后反向返回）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Linear'           // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(10, 10, '蓝色矩形往返循环移动（4秒/单程）', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
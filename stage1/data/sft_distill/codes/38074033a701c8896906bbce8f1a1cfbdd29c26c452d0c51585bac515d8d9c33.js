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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 200, 150); // 绘制 200x150 的矩形
  
  // 生成纹理
  graphics.generateTexture('rectTexture', 200, 150);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建矩形精灵并居中显示
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 添加说明文字
  const text = this.add.text(400, 100, '矩形缩放动画\n3秒缩放到16%后恢复\n无限循环', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
  
  // 创建缩放动画
  this.tweens.add({
    targets: rect,           // 动画目标
    scaleX: 0.16,           // X轴缩放到16%
    scaleY: 0.16,           // Y轴缩放到16%
    duration: 3000,         // 持续时间3秒
    ease: 'Sine.easeInOut', // 缓动函数，使动画更平滑
    yoyo: true,             // 动画结束后反向播放（恢复原始大小）
    loop: -1                // 无限循环（-1表示永久循环）
  });
}

new Phaser.Game(config);
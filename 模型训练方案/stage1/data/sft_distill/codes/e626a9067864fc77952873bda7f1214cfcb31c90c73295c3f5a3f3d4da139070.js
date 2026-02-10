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
  // 使用 Graphics 绘制矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建使用该纹理的 Sprite，并居中显示
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    scaleX: 0.48,           // X 轴缩放到 48%
    scaleY: 0.48,           // Y 轴缩放到 48%
    duration: 2000,         // 单程持续时间 2 秒
    yoyo: true,             // 启用往返效果（缩放到 48% 后再恢复到 100%）
    loop: -1,               // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'  // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Rectangle scaling to 48% and back\nLooping animation', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);
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
  // 使用 Graphics 生成矩形纹理
  const graphics = this.add.graphics();
  
  // 绘制一个蓝色矩形
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 200, 150);
  
  // 添加边框使效果更明显
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokeRect(0, 0, 200, 150);
  
  // 生成纹理
  graphics.generateTexture('rectangle', 200, 150);
  
  // 清理 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建矩形精灵，放置在屏幕中央
  const rectangle = this.add.sprite(400, 300, 'rectangle');
  
  // 添加文字提示
  this.add.text(400, 100, '矩形缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 500, '缩放范围: 100% ↔ 48%', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: rectangle,           // 动画目标对象
    scaleX: 0.48,                 // X 轴缩放到 48%
    scaleY: 0.48,                 // Y 轴缩放到 48%
    duration: 3000,               // 持续时间 3 秒
    ease: 'Sine.easeInOut',       // 缓动函数，使动画更平滑
    yoyo: true,                   // 往返播放（缩小后再放大）
    loop: -1,                     // 无限循环 (-1 表示永久循环)
    onLoop: function() {
      // 每次循环时的回调（可选）
      console.log('动画循环一次');
    }
  });
  
  // 添加调试信息显示当前缩放值
  const debugText = this.add.text(400, 530, '', {
    fontSize: '14px',
    color: '#00ff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 更新调试信息
  this.events.on('update', () => {
    debugText.setText(`当前缩放: ${(rectangle.scaleX * 100).toFixed(1)}%`);
  });
}

// 创建游戏实例
new Phaser.Game(config);
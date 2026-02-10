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
  // 使用 Graphics 生成方块纹理
  const graphics = this.add.graphics();
  
  // 绘制一个蓝色方块
  graphics.fillStyle(0x4a90e2, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理并命名为 'box'
  graphics.generateTexture('box', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
}

function create() {
  // 在屏幕中央创建方块精灵
  const box = this.add.sprite(400, 300, 'box');
  
  // 创建缩放动画
  this.tweens.add({
    targets: box,           // 动画目标对象
    scaleX: 0.8,           // X轴缩放到 80%
    scaleY: 0.8,           // Y轴缩放到 80%
    duration: 2000,        // 动画持续时间 2 秒
    yoyo: true,            // 启用往返效果（缩放后恢复）
    repeat: -1,            // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut' // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 50, '方块缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 80%，周期: 4秒', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);
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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 设置星形的填充颜色
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形（中心点在 (100, 100)，5个角，外半径50，内半径25）
  graphics.fillStar(100, 100, 5, 25, 50);
  
  // 将绘制的图形生成为纹理
  graphics.generateTexture('starTexture', 200, 200);
  
  // 销毁临时的 graphics 对象
  graphics.destroy();
  
  // 在场景中心创建星形精灵
  const star = this.add.sprite(400, 300, 'starTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,           // 动画目标
    scaleX: 0.16,           // X轴缩放到16%
    scaleY: 0.16,           // Y轴缩放到16%
    duration: 1500,         // 动画持续1.5秒
    yoyo: true,             // 启用往返效果（缩放后恢复）
    loop: -1,               // 无限循环（-1表示永久循环）
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 550, '星形缩放动画：1.5秒缩放到16%后恢复，循环播放', {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);
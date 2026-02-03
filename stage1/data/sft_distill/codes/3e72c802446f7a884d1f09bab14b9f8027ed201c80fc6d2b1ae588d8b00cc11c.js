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
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 12;
  
  // 椭圆尺寸参数
  const ellipseWidth = 60;
  const ellipseHeight = 40;
  const halfWidth = ellipseWidth / 2;
  const halfHeight = ellipseHeight / 2;
  
  // 创建定时器事件，每 3 秒执行一次
  this.time.addEvent({
    delay: 3000, // 3 秒
    callback: () => {
      // 生成随机位置（确保椭圆完全在画布内）
      const x = Phaser.Math.Between(halfWidth, config.width - halfWidth);
      const y = Phaser.Math.Between(halfHeight, config.height - halfHeight);
      
      // 创建 Graphics 对象绘制粉色椭圆
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff69b4, 1); // 粉色
      graphics.fillEllipse(x, y, ellipseWidth, ellipseHeight);
      
      ellipseCount++;
      console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: 11, // 重复 11 次，加上首次执行共 12 次
    startAt: 0 // 立即开始第一次
  });
  
  // 添加提示文本
  const text = this.add.text(10, 10, '每 3 秒生成一个粉色椭圆\n最多生成 12 个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);
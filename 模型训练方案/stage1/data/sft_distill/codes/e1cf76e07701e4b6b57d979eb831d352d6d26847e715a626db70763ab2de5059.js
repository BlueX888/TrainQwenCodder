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
  // 无需预加载资源
}

function create() {
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 5;
  
  // 创建定时器，每 3 秒触发一次
  this.time.addEvent({
    delay: 3000, // 3 秒
    callback: () => {
      // 生成随机位置
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      // 创建 Graphics 对象绘制椭圆
      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1); // 灰色
      graphics.fillEllipse(x, y, 60, 40); // 椭圆：中心点(x,y)，宽度60，高度40
      
      // 递增计数器
      ellipseCount++;
      
      console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: 4 // 重复 4 次，加上首次执行共 5 次
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每3秒生成一个灰色椭圆，最多5个', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
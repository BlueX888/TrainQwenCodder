// 完整的 Phaser3 代码
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
  // 无需预加载外部资源
}

function create() {
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 10;
  
  // 创建定时器事件，每 0.5 秒触发一次
  this.time.addEvent({
    delay: 500,                    // 延迟 500 毫秒（0.5 秒）
    callback: () => {
      // 生成随机位置
      const randomX = Phaser.Math.Between(50, 750);
      const randomY = Phaser.Math.Between(50, 550);
      
      // 生成随机大小的椭圆（宽度和高度）
      const randomWidth = Phaser.Math.Between(30, 80);
      const randomHeight = Phaser.Math.Between(20, 60);
      
      // 创建白色椭圆
      const ellipse = this.add.ellipse(
        randomX,           // x 坐标
        randomY,           // y 坐标
        randomWidth,       // 宽度
        randomHeight,      // 高度
        0xffffff           // 白色
      );
      
      ellipseCount++;
      console.log(`生成第 ${ellipseCount} 个椭圆，位置: (${randomX}, ${randomY})`);
    },
    callbackScope: this,
    repeat: 9                      // 重复 9 次，加上首次执行共 10 次
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每 0.5 秒生成一个白色椭圆\n最多生成 10 个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

// 启动游戏
new Phaser.Game(config);
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
  // 记录已生成的圆形数量
  let circleCount = 0;
  const maxCircles = 5;
  
  // 创建定时器事件，每 0.5 秒触发一次
  this.time.addEvent({
    delay: 500,                    // 0.5 秒 = 500 毫秒
    callback: () => {
      // 生成随机位置
      const radius = 30;           // 圆形半径
      const x = Phaser.Math.Between(radius, config.width - radius);
      const y = Phaser.Math.Between(radius, config.height - radius);
      
      // 使用 Graphics 绘制灰色圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x808080, 1);  // 灰色
      graphics.fillCircle(x, y, radius);
      
      circleCount++;
      console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: maxCircles - 1         // repeat 4 次，加上初始执行共 5 次
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每 0.5 秒生成一个灰色圆形\n最多生成 5 个', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);
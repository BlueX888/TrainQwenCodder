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
  // 计数器，用于跟踪已生成的圆形数量
  let circleCount = 0;
  const maxCircles = 5;
  
  // 添加提示文本
  const text = this.add.text(10, 10, '红色圆形将每隔2.5秒生成一个，最多5个', {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500,                    // 延迟2500毫秒（2.5秒）
    callback: () => {
      // 生成随机位置（确保圆形完全在画布内）
      const radius = 30;
      const randomX = Phaser.Math.Between(radius, 800 - radius);
      const randomY = Phaser.Math.Between(radius + 40, 600 - radius);
      
      // 创建 Graphics 对象绘制红色圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);  // 红色，不透明
      graphics.fillCircle(randomX, randomY, radius);
      
      // 增加计数器
      circleCount++;
      
      // 更新提示文本
      text.setText(`已生成 ${circleCount}/${maxCircles} 个红色圆形`);
      
      console.log(`生成第 ${circleCount} 个圆形，位置: (${randomX}, ${randomY})`);
    },
    callbackScope: this,
    repeat: maxCircles - 1,         // 重复4次，加上首次执行共5次
    startAt: 0                      // 立即开始第一次执行
  });
}

new Phaser.Game(config);
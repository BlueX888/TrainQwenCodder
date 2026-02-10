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
  // 计数器，用于跟踪已生成的矩形数量
  let rectangleCount = 0;
  const maxRectangles = 20;
  
  // 矩形尺寸
  const rectWidth = 50;
  const rectHeight = 50;
  
  // 添加文本提示
  const infoText = this.add.text(10, 10, `矩形数量: ${rectangleCount}/${maxRectangles}`, {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每隔 3 秒执行一次
  this.time.addEvent({
    delay: 3000,                    // 3 秒间隔
    callback: () => {
      // 生成随机位置（确保矩形完全在画布内）
      const randomX = Phaser.Math.Between(0, this.scale.width - rectWidth);
      const randomY = Phaser.Math.Between(0, this.scale.height - rectHeight);
      
      // 使用 Graphics 绘制青色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ffff, 1);  // 青色 (Cyan)
      graphics.fillRect(randomX, randomY, rectWidth, rectHeight);
      
      // 更新计数器
      rectangleCount++;
      infoText.setText(`矩形数量: ${rectangleCount}/${maxRectangles}`);
      
      console.log(`生成第 ${rectangleCount} 个矩形，位置: (${randomX}, ${randomY})`);
    },
    callbackScope: this,
    repeat: maxRectangles - 1      // 重复 19 次，加上首次执行共 20 次
  });
  
  // 添加完成提示
  this.time.delayedCall(3000 * maxRectangles, () => {
    const completeText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      '所有矩形已生成完毕！',
      {
        fontSize: '24px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    completeText.setOrigin(0.5);
  });
}

new Phaser.Game(config);
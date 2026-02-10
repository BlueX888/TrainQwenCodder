// 完整的 Phaser3 代码
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    create: create
  }
};

function create() {
  // 记录已生成的圆形数量
  let circleCount = 0;
  const maxCircles = 8;
  const circleRadius = 20;

  // 创建定时器事件，每隔 1.5 秒执行一次
  this.time.addEvent({
    delay: 1500,              // 1.5 秒
    callback: () => {
      // 生成随机位置（确保圆形完全在画布内）
      const x = Phaser.Math.Between(circleRadius, config.width - circleRadius);
      const y = Phaser.Math.Between(circleRadius, config.height - circleRadius);

      // 使用 Graphics 绘制红色圆形
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);  // 红色，不透明
      graphics.fillCircle(x, y, circleRadius);

      // 递增计数器
      circleCount++;
      console.log(`生成第 ${circleCount} 个圆形，位置: (${x}, ${y})`);
    },
    callbackScope: this,
    repeat: maxCircles - 1    // 重复 7 次，加上首次执行共 8 次
  });
}

new Phaser.Game(config);
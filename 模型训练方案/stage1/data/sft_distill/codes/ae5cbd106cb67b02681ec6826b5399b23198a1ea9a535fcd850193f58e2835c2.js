const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let circle;
const FOLLOW_SPEED = 120; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  graphics.generateTexture('circleTexture', 50, 50);
  graphics.destroy();

  // 创建圆形精灵，初始位置在屏幕中心
  circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 显示提示文字
  this.add.text(10, 10, 'Move your mouse - circle will follow smoothly', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标指针位置
  const pointer = this.input.activePointer;
  const mouseX = pointer.x;
  const mouseY = pointer.y;

  // 计算圆形与鼠标之间的距离
  const distance = Phaser.Math.Distance.Between(
    circle.x,
    circle.y,
    mouseX,
    mouseY
  );

  // 如果距离大于1像素才移动（避免微小抖动）
  if (distance > 1) {
    // 计算圆形指向鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      circle.x,
      circle.y,
      mouseX,
      mouseY
    );

    // 根据速度和时间计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果剩余距离小于本帧移动距离，直接到达目标点
    if (distance < moveDistance) {
      circle.x = mouseX;
      circle.y = mouseY;
    } else {
      // 否则按照角度和速度移动
      circle.x += Math.cos(angle) * moveDistance;
      circle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let pointer;
const FOLLOW_SPEED = 200; // 像素/秒

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();

  // 创建椭圆精灵，初始位置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 获取输入指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算椭圆中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x,
    ellipse.y,
    pointer.x,
    pointer.y
  );

  // 如果距离大于1像素才移动（避免抖动）
  if (distance > 1) {
    // 计算从椭圆到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      pointer.x,
      pointer.y
    );

    // 根据速度和时间增量计算本帧移动距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果本帧移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      ellipse.x = pointer.x;
      ellipse.y = pointer.y;
    } else {
      // 否则按角度方向移动
      ellipse.x += Math.cos(angle) * moveDistance;
      ellipse.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
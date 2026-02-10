const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let pointer;
const FOLLOW_SPEED = 240; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(30, 20, 60, 40); // 中心点(30,20)，宽60，高40
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy();

  // 创建椭圆精灵，初始位置在画布中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');

  // 获取输入指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算椭圆当前位置到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x,
    ellipse.y,
    pointer.x,
    pointer.y
  );

  // 只有当距离大于一个很小的阈值时才移动，避免抖动
  if (distance > 1) {
    // 计算从椭圆到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      pointer.x,
      pointer.y
    );

    // 根据速度和时间差计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);

    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      ellipse.x = pointer.x;
      ellipse.y = pointer.y;
    } else {
      // 按角度方向移动指定距离
      ellipse.x += Math.cos(angle) * moveDistance;
      ellipse.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);
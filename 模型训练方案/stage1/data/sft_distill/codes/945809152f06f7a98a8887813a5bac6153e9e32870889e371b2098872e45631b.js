const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let bullets;
let cursors;
let wasdKeys;
let spaceKey;
let shotsFired = 0; // 可验证状态信号
let scoreText;

function preload() {
  // 创建玩家纹理（三角形指示朝向）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(20, 0);
  graphics.lineTo(-10, -10);
  graphics.lineTo(-10, 10);
  graphics.closePath();
  graphics.fillPath();
  graphics.generateTexture('player', 30, 20);
  graphics.destroy();

  // 创建子弹纹理（圆形）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.95);
  player.setMaxVelocity(200);

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: true
  });

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  wasdKeys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 空格键发射子弹
  spaceKey.on('down', () => {
    shootBullet.call(this);
  });

  // 显示发射次数
  scoreText = this.add.text(16, 16, 'Shots Fired: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 添加说明文字
  this.add.text(16, 50, 'WASD: Rotate & Move | SPACE: Shoot', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 旋转控制
  if (wasdKeys.left.isDown) {
    player.setAngularVelocity(-200);
  } else if (wasdKeys.right.isDown) {
    player.setAngularVelocity(200);
  } else {
    player.setAngularVelocity(0);
  }

  // 前后移动控制
  if (wasdKeys.up.isDown) {
    // 向当前朝向移动
    this.physics.velocityFromRotation(
      player.rotation,
      150,
      player.body.acceleration
    );
  } else if (wasdKeys.down.isDown) {
    // 向相反方向移动
    this.physics.velocityFromRotation(
      player.rotation,
      -150,
      player.body.acceleration
    );
  } else {
    player.setAcceleration(0);
  }

  // 清理超出边界的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      if (
        bullet.x < -10 ||
        bullet.x > 810 ||
        bullet.y < -10 ||
        bullet.y > 610
      ) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    }
  });
}

function shootBullet() {
  // 获取或创建子弹
  const bullet = bullets.get(player.x, player.y, 'bullet');

  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);

    // 根据玩家当前角度设置子弹速度
    const bulletSpeed = 400;
    this.physics.velocityFromRotation(
      player.rotation,
      bulletSpeed,
      bullet.body.velocity
    );

    // 设置子弹角度与玩家一致
    bullet.rotation = player.rotation;

    // 增加发射计数
    shotsFired++;
    scoreText.setText('Shots Fired: ' + shotsFired);

    // 子弹生命周期（3秒后自动销毁）
    this.time.delayedCall(3000, () => {
      if (bullet.active) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }
}

const game = new Phaser.Game(config);
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

// 状态变量
let player;
let dashCount = 0; // 冲刺次数
let canDash = true; // 是否可以冲刺
let dashCooldownText;
let dashCountText;
let velocityText;

const DASH_SPEED = 300 * 3; // 900
const DASH_DURATION = 200; // 冲刺持续时间（毫秒）
const DASH_COOLDOWN = 500; // 冷却时间（毫秒）

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建白色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setDamping(true);
  player.setDrag(0.95);

  // 添加状态文本
  dashCountText = this.add.text(10, 10, 'Dash Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  dashCooldownText = this.add.text(10, 40, 'Dash Ready', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  velocityText = this.add.text(10, 70, 'Velocity: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 添加提示文本
  this.add.text(10, 550, 'Right Click to Dash', {
    fontSize: '18px',
    fill: '#888888'
  });

  // 监听鼠标右键
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown() && canDash) {
      performDash.call(this, pointer);
    }
  });

  // 禁用右键菜单
  this.input.mouse.disableContextMenu();
}

function performDash(pointer) {
  // 计算从角色到鼠标的方向
  const angle = Phaser.Math.Angle.Between(
    player.x,
    player.y,
    pointer.x,
    pointer.y
  );

  // 设置冲刺速度
  const velocityX = Math.cos(angle) * DASH_SPEED;
  const velocityY = Math.sin(angle) * DASH_SPEED;
  
  player.setVelocity(velocityX, velocityY);

  // 增加冲刺计数
  dashCount++;
  dashCountText.setText('Dash Count: ' + dashCount);

  // 设置冷却状态
  canDash = false;
  dashCooldownText.setText('Dash Cooldown');
  dashCooldownText.setColor('#ff0000');

  // 冲刺持续时间后减速
  this.time.addEvent({
    delay: DASH_DURATION,
    callback: () => {
      // 减速到正常速度
      player.setVelocity(
        player.body.velocity.x * 0.3,
        player.body.velocity.y * 0.3
      );
    }
  });

  // 冷却时间后恢复
  this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      dashCooldownText.setText('Dash Ready');
      dashCooldownText.setColor('#00ff00');
    }
  });
}

function update() {
  // 更新速度显示
  const speed = Math.sqrt(
    player.body.velocity.x ** 2 + 
    player.body.velocity.y ** 2
  ).toFixed(0);
  velocityText.setText('Velocity: ' + speed);

  // 可选：添加键盘移动控制（便于测试）
  const cursors = this.input.keyboard.createCursorKeys();
  const normalSpeed = 200;

  if (cursors.left.isDown) {
    player.setVelocityX(-normalSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(normalSpeed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-normalSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(normalSpeed);
  }
}

new Phaser.Game(config);
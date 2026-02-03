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

// 全局信号对象
window.__signals__ = {
  dashCount: 0,
  isDashing: false,
  canDash: true,
  playerX: 0,
  playerY: 0,
  velocity: { x: 0, y: 0 }
};

let player;
let cursors;
let spaceKey;
let isDashing = false;
let canDash = true;
let dashTimer = null;
let cooldownTimer = null;

const NORMAL_SPEED = 200;
const DASH_SPEED = 200 * 3; // 600
const DASH_DURATION = 200; // 冲刺持续时间 200ms
const DASH_COOLDOWN = 500; // 冷却时间 500ms

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 设置输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 空格键按下事件
  spaceKey.on('down', () => {
    if (canDash && !isDashing) {
      performDash.call(this);
    }
  });

  // 创建冷却状态显示文本
  this.cooldownText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 创建冲刺计数显示
  this.dashCountText = this.add.text(10, 30, 'Dashes: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 创建速度显示
  this.speedText = this.add.text(10, 50, 'Speed: 0', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  console.log(JSON.stringify({
    event: 'game_start',
    timestamp: Date.now(),
    normalSpeed: NORMAL_SPEED,
    dashSpeed: DASH_SPEED,
    dashDuration: DASH_DURATION,
    dashCooldown: DASH_COOLDOWN
  }));
}

function performDash() {
  isDashing = true;
  canDash = false;
  window.__signals__.dashCount++;
  window.__signals__.isDashing = true;
  window.__signals__.canDash = false;

  // 获取当前移动方向
  let dashDirection = new Phaser.Math.Vector2(0, 0);
  
  if (cursors.left.isDown) {
    dashDirection.x = -1;
  } else if (cursors.right.isDown) {
    dashDirection.x = 1;
  }
  
  if (cursors.up.isDown) {
    dashDirection.y = -1;
  } else if (cursors.down.isDown) {
    dashDirection.y = 1;
  }

  // 如果没有方向输入，默认向右冲刺
  if (dashDirection.x === 0 && dashDirection.y === 0) {
    dashDirection.x = 1;
  }

  // 归一化方向向量
  dashDirection.normalize();

  // 应用冲刺速度
  player.setVelocity(
    dashDirection.x * DASH_SPEED,
    dashDirection.y * DASH_SPEED
  );

  console.log(JSON.stringify({
    event: 'dash_start',
    timestamp: Date.now(),
    dashCount: window.__signals__.dashCount,
    direction: { x: dashDirection.x, y: dashDirection.y },
    velocity: { x: player.body.velocity.x, y: player.body.velocity.y },
    position: { x: player.x, y: player.y }
  }));

  // 冲刺持续时间计时器
  if (dashTimer) {
    dashTimer.destroy();
  }
  dashTimer = this.time.addEvent({
    delay: DASH_DURATION,
    callback: () => {
      isDashing = false;
      window.__signals__.isDashing = false;
      
      console.log(JSON.stringify({
        event: 'dash_end',
        timestamp: Date.now(),
        position: { x: player.x, y: player.y }
      }));
    },
    callbackScope: this
  });

  // 冷却计时器
  if (cooldownTimer) {
    cooldownTimer.destroy();
  }
  cooldownTimer = this.time.addEvent({
    delay: DASH_COOLDOWN,
    callback: () => {
      canDash = true;
      window.__signals__.canDash = true;
      
      console.log(JSON.stringify({
        event: 'dash_ready',
        timestamp: Date.now()
      }));
    },
    callbackScope: this
  });
}

function update() {
  // 如果不在冲刺状态，使用正常移动
  if (!isDashing) {
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
      velocityX = -NORMAL_SPEED;
    } else if (cursors.right.isDown) {
      velocityX = NORMAL_SPEED;
    }

    if (cursors.up.isDown) {
      velocityY = -NORMAL_SPEED;
    } else if (cursors.down.isDown) {
      velocityY = NORMAL_SPEED;
    }

    player.setVelocity(velocityX, velocityY);
  }

  // 更新信号
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.playerY = Math.round(player.y);
  window.__signals__.velocity.x = Math.round(player.body.velocity.x);
  window.__signals__.velocity.y = Math.round(player.body.velocity.y);

  // 更新UI
  const currentSpeed = Math.sqrt(
    player.body.velocity.x ** 2 + player.body.velocity.y ** 2
  );
  
  this.cooldownText.setText(
    canDash ? 'Dash Ready!' : 'Cooling down...'
  );
  this.cooldownText.setColor(canDash ? '#00ff00' : '#ff0000');
  
  this.dashCountText.setText(`Dashes: ${window.__signals__.dashCount}`);
  
  this.speedText.setText(`Speed: ${Math.round(currentSpeed)}`);
  this.speedText.setColor(isDashing ? '#ffff00' : '#ffffff');
}

new Phaser.Game(config);
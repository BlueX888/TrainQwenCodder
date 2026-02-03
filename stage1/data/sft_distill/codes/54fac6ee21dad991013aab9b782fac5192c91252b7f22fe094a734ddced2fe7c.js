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
let cursors;
let dashSpeed = 600; // 200 * 3
let normalSpeed = 200;
let isDashing = false;
let canDash = true;
let dashDuration = 200; // 冲刺持续时间（毫秒）
let dashCooldown = 2500; // 冷却时间（毫秒）
let dashCount = 0; // 冲刺次数统计
let cooldownText;
let dashCountText;
let statusText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（灰色方块）
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('playerTexture', 40, 40);
  graphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerTexture');
  player.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加额外的WASD键支持
  this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    space: Phaser.Input.Keyboard.KeyCodes.SPACE
  });

  // 创建UI文本
  statusText = this.add.text(16, 16, 'Status: Ready', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  dashCountText = this.add.text(16, 46, 'Dash Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  cooldownText = this.add.text(16, 76, 'Cooldown: Ready', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  // 添加操作说明
  this.add.text(16, 550, 'Use Arrow Keys to move and dash', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  if (!isDashing) {
    // 正常移动
    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
      velocityX = -normalSpeed;
    } else if (cursors.right.isDown) {
      velocityX = normalSpeed;
    }

    if (cursors.up.isDown) {
      velocityY = -normalSpeed;
    } else if (cursors.down.isDown) {
      velocityY = normalSpeed;
    }

    // 归一化对角线移动速度
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    player.setVelocity(velocityX, velocityY);

    // 检测冲刺输入
    if (canDash && !isDashing) {
      let dashDirectionX = 0;
      let dashDirectionY = 0;

      if (cursors.left.isDown) {
        dashDirectionX = -1;
      } else if (cursors.right.isDown) {
        dashDirectionX = 1;
      }

      if (cursors.up.isDown) {
        dashDirectionY = -1;
      } else if (cursors.down.isDown) {
        dashDirectionY = 1;
      }

      // 如果有方向键按下，执行冲刺
      if (dashDirectionX !== 0 || dashDirectionY !== 0) {
        performDash(dashDirectionX, dashDirectionY, this);
      }
    }
  }

  // 更新状态文本
  if (isDashing) {
    statusText.setText('Status: Dashing!');
    statusText.setColor('#ffff00');
  } else if (!canDash) {
    statusText.setText('Status: Cooling down...');
    statusText.setColor('#ff8800');
  } else {
    statusText.setText('Status: Ready');
    statusText.setColor('#00ff00');
  }
}

function performDash(dirX, dirY, scene) {
  // 归一化方向
  const length = Math.sqrt(dirX * dirX + dirY * dirY);
  if (length > 0) {
    dirX /= length;
    dirY /= length;
  }

  // 开始冲刺
  isDashing = true;
  canDash = false;
  dashCount++;

  // 更新冲刺次数
  dashCountText.setText('Dash Count: ' + dashCount);

  // 设置冲刺速度
  player.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

  // 冲刺持续时间结束
  scene.time.delayedCall(dashDuration, () => {
    isDashing = false;
    player.setVelocity(0, 0);
  });

  // 冷却计时器
  let remainingCooldown = dashCooldown;
  const cooldownTimer = scene.time.addEvent({
    delay: 100,
    callback: () => {
      remainingCooldown -= 100;
      const seconds = (remainingCooldown / 1000).toFixed(1);
      cooldownText.setText('Cooldown: ' + seconds + 's');
      cooldownText.setColor('#ff0000');
    },
    repeat: dashCooldown / 100 - 1
  });

  // 冷却结束
  scene.time.delayedCall(dashCooldown, () => {
    canDash = true;
    cooldownText.setText('Cooldown: Ready');
    cooldownText.setColor('#00ff00');
  });
}

new Phaser.Game(config);
class DashScene extends Phaser.Scene {
  constructor() {
    super('DashScene');
    this.dashCount = 0; // 状态信号：冲刺次数
    this.dashCooldown = 0; // 状态信号：冷却剩余时间(ms)
  }

  preload() {
    // 程序化生成粉色角色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 绘制圆形角色
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 生成地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x808080, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();
  }

  create() {
    // 创建物理角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(800, 0); // 添加拖拽以减速
    this.player.setBounce(0);

    // 创建地面（可选，用于更好的视觉效果）
    const ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.physics.add.collider(this.player, ground);

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 冲刺状态
    this.canDash = true;
    this.dashSpeed = 300 * 3; // 900
    this.dashCooldownTime = 2500; // 2.5秒 = 2500毫秒
    this.isDashing = false;
    this.dashDuration = 150; // 冲刺持续时间（毫秒）

    // 创建冷却计时器（初始不启动）
    this.cooldownTimer = null;

    // 添加文本显示状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听按键按下事件进行冲刺
    this.input.keyboard.on('keydown', (event) => {
      if (this.canDash && !this.isDashing) {
        let dashVelocityX = 0;
        let dashVelocityY = 0;

        // 根据按键确定冲刺方向
        if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.W) {
          dashVelocityY = -this.dashSpeed;
        } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.S) {
          dashVelocityY = this.dashSpeed;
        } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.A) {
          dashVelocityX = -this.dashSpeed;
        } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.D) {
          dashVelocityX = this.dashSpeed;
        }

        // 如果有冲刺方向，执行冲刺
        if (dashVelocityX !== 0 || dashVelocityY !== 0) {
          this.executeDash(dashVelocityX, dashVelocityY);
        }
      }
    });
  }

  executeDash(velocityX, velocityY) {
    this.isDashing = true;
    this.canDash = false;
    this.dashCount++; // 增加冲刺计数

    // 应用冲刺速度
    this.player.setVelocity(velocityX, velocityY);

    // 冲刺持续时间后恢复正常
    this.time.delayedCall(this.dashDuration, () => {
      this.isDashing = false;
      // 可选：减速或停止
      this.player.setVelocity(
        this.player.body.velocity.x * 0.3,
        this.player.body.velocity.y * 0.3
      );
    });

    // 启动冷却计时器
    this.dashCooldown = this.dashCooldownTime;
    
    if (this.cooldownTimer) {
      this.cooldownTimer.destroy();
    }

    this.cooldownTimer = this.time.addEvent({
      delay: this.dashCooldownTime,
      callback: () => {
        this.canDash = true;
        this.dashCooldown = 0;
      }
    });
  }

  update(time, delta) {
    // 更新冷却剩余时间
    if (!this.canDash && this.cooldownTimer) {
      this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    }

    // 正常移动（非冲刺时）
    if (!this.isDashing) {
      const normalSpeed = 200;
      let velocityX = 0;
      let velocityY = 0;

      if (this.keys.W.isDown) {
        velocityY = -normalSpeed;
      } else if (this.keys.S.isDown) {
        velocityY = normalSpeed;
      }

      if (this.keys.A.isDown) {
        velocityX = -normalSpeed;
      } else if (this.keys.D.isDown) {
        velocityX = normalSpeed;
      }

      // 只在非冲刺时应用正常速度
      if (velocityX !== 0 || velocityY !== 0) {
        this.player.setVelocity(velocityX, velocityY);
      }
    }

    // 更新状态显示
    const cooldownSec = (this.dashCooldown / 1000).toFixed(2);
    this.statusText.setText([
      `Dash Count: ${this.dashCount}`,
      `Cooldown: ${this.canDash ? 'Ready' : cooldownSec + 's'}`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `Status: ${this.isDashing ? 'DASHING!' : 'Normal'}`,
      '',
      'Controls: WASD to dash (2.5s cooldown)'
    ]);
  }
}

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
  scene: DashScene
};

new Phaser.Game(config);
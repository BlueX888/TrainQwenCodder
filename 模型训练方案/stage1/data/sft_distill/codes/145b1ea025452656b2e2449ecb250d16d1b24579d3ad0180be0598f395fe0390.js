const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象，用于验证
window.__signals__ = {
  health: 3,
  maxHealth: 3,
  lastDamageTime: 0,
  lastHealTime: 0,
  totalDamage: 0,
  totalHeal: 0
};

let currentHealth = 3;
const maxHealth = 3;
let healthBarGraphics = [];
let healthText;
let healTimer;
let keyW, keyA, keyS, keyD;
let lastKeyPressTime = 0;
const keyPressCooldown = 200; // 按键冷却时间，避免连续触发

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建标题
  const title = this.add.text(400, 50, 'Health Bar System', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);

  // 创建说明文字
  const instructions = this.add.text(400, 100, 'Press W/A/S/D to take damage\nAuto heal 1 HP every 2.5 seconds', {
    fontSize: '18px',
    color: '#aaaaaa',
    align: 'center'
  });
  instructions.setOrigin(0.5);

  // 创建血条容器
  const healthBarX = 250;
  const healthBarY = 200;
  const barWidth = 80;
  const barHeight = 80;
  const barSpacing = 20;

  // 创建3个血条方格
  for (let i = 0; i < maxHealth; i++) {
    const graphics = this.add.graphics();
    const x = healthBarX + i * (barWidth + barSpacing);
    
    healthBarGraphics.push({
      graphics: graphics,
      x: x,
      y: healthBarY,
      width: barWidth,
      height: barHeight
    });
  }

  // 初始化血条显示
  updateHealthBar();

  // 创建生命值文字显示
  healthText = this.add.text(400, 320, `Health: ${currentHealth} / ${maxHealth}`, {
    fontSize: '24px',
    color: '#ffffff'
  });
  healthText.setOrigin(0.5);

  // 创建状态信息显示
  const statusText = this.add.text(400, 370, 'Status: Waiting...', {
    fontSize: '18px',
    color: '#ffff00'
  });
  statusText.setOrigin(0.5);
  statusText.name = 'statusText';

  // 设置键盘输入
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // 监听按键按下事件
  keyW.on('down', () => takeDamage(this, 'W'));
  keyA.on('down', () => takeDamage(this, 'A'));
  keyS.on('down', () => takeDamage(this, 'S'));
  keyD.on('down', () => takeDamage(this, 'D'));

  // 创建自动回血定时器（每2.5秒触发一次）
  healTimer = this.time.addEvent({
    delay: 2500,
    callback: () => autoHeal(this),
    callbackScope: this,
    loop: true
  });

  // 创建调试信息显示
  const debugText = this.add.text(20, 450, '', {
    fontSize: '14px',
    color: '#888888'
  });
  debugText.name = 'debugText';

  console.log('Game initialized:', JSON.stringify(window.__signals__));
}

function update(time, delta) {
  // 更新调试信息
  const debugText = this.children.getByName('debugText');
  if (debugText) {
    debugText.setText([
      `Health: ${currentHealth}/${maxHealth}`,
      `Total Damage: ${window.__signals__.totalDamage}`,
      `Total Heal: ${window.__signals__.totalHeal}`,
      `Next heal in: ${Math.ceil((2500 - healTimer.getElapsed()) / 1000)}s`
    ]);
  }
}

function updateHealthBar() {
  // 更新每个血条方格的显示
  for (let i = 0; i < maxHealth; i++) {
    const bar = healthBarGraphics[i];
    bar.graphics.clear();

    // 绘制边框
    bar.graphics.lineStyle(4, 0x666666, 1);
    bar.graphics.strokeRect(bar.x, bar.y, bar.width, bar.height);

    // 根据当前生命值填充颜色
    if (i < currentHealth) {
      // 有生命值：红色填充
      bar.graphics.fillStyle(0xff3333, 1);
      bar.graphics.fillRect(bar.x + 4, bar.y + 4, bar.width - 8, bar.height - 8);
      
      // 添加高光效果
      bar.graphics.fillStyle(0xff6666, 0.5);
      bar.graphics.fillRect(bar.x + 4, bar.y + 4, bar.width - 8, (bar.height - 8) / 2);
    } else {
      // 无生命值：深灰色填充
      bar.graphics.fillStyle(0x333333, 1);
      bar.graphics.fillRect(bar.x + 4, bar.y + 4, bar.width - 8, bar.height - 8);
    }

    // 添加生命值数字
    const existingText = bar.graphics.scene.children.getByName(`healthNum${i}`);
    if (existingText) {
      existingText.destroy();
    }
    
    const numText = bar.graphics.scene.add.text(
      bar.x + bar.width / 2,
      bar.y + bar.height / 2,
      i < currentHealth ? '♥' : '✕',
      {
        fontSize: '32px',
        color: i < currentHealth ? '#ffffff' : '#555555'
      }
    );
    numText.setOrigin(0.5);
    numText.name = `healthNum${i}`;
  }

  // 更新文字显示
  if (healthText) {
    healthText.setText(`Health: ${currentHealth} / ${maxHealth}`);
  }
}

function takeDamage(scene, key) {
  const currentTime = scene.time.now;
  
  // 冷却时间检查
  if (currentTime - lastKeyPressTime < keyPressCooldown) {
    return;
  }
  lastKeyPressTime = currentTime;

  if (currentHealth > 0) {
    currentHealth--;
    window.__signals__.health = currentHealth;
    window.__signals__.lastDamageTime = currentTime;
    window.__signals__.totalDamage++;

    updateHealthBar();

    // 更新状态文字
    const statusText = scene.children.getByName('statusText');
    if (statusText) {
      statusText.setText(`Damage taken! (Key: ${key}) - HP: ${currentHealth}`);
      statusText.setColor('#ff3333');
      
      // 0.5秒后恢复颜色
      scene.time.delayedCall(500, () => {
        statusText.setColor('#ffff00');
      });
    }

    // 创建伤害特效
    createDamageEffect(scene, key);

    console.log('Damage taken:', JSON.stringify({
      key: key,
      health: currentHealth,
      time: currentTime
    }));

    // 如果生命值为0，显示死亡信息
    if (currentHealth === 0) {
      const statusText = scene.children.getByName('statusText');
      if (statusText) {
        statusText.setText('Health depleted! Still healing...');
        statusText.setColor('#ff0000');
      }
    }
  }
}

function autoHeal(scene) {
  if (currentHealth < maxHealth) {
    currentHealth++;
    window.__signals__.health = currentHealth;
    window.__signals__.lastHealTime = scene.time.now;
    window.__signals__.totalHeal++;

    updateHealthBar();

    // 更新状态文字
    const statusText = scene.children.getByName('statusText');
    if (statusText) {
      statusText.setText(`Auto healed +1 HP! Current: ${currentHealth}`);
      statusText.setColor('#33ff33');
      
      // 1秒后恢复颜色
      scene.time.delayedCall(1000, () => {
        statusText.setColor('#ffff00');
      });
    }

    // 创建治疗特效
    createHealEffect(scene);

    console.log('Auto heal:', JSON.stringify({
      health: currentHealth,
      time: scene.time.now
    }));
  }
}

function createDamageEffect(scene, key) {
  // 在对应血条位置创建伤害特效
  const bar = healthBarGraphics[currentHealth]; // 显示在刚失去的血条位置
  if (!bar) return;

  const effect = scene.add.graphics();
  effect.fillStyle(0xff0000, 0.8);
  effect.fillCircle(bar.x + bar.width / 2, bar.y + bar.height / 2, 50);

  // 添加文字
  const text = scene.add.text(bar.x + bar.width / 2, bar.y + bar.height / 2, '-1', {
    fontSize: '28px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  text.setOrigin(0.5);

  // 动画效果
  scene.tweens.add({
    targets: [effect, text],
    alpha: 0,
    y: '-=50',
    duration: 800,
    ease: 'Power2',
    onComplete: () => {
      effect.destroy();
      text.destroy();
    }
  });
}

function createHealEffect(scene) {
  // 在恢复的血条位置创建治疗特效
  const bar = healthBarGraphics[currentHealth - 1];
  if (!bar) return;

  const effect = scene.add.graphics();
  effect.fillStyle(0x33ff33, 0.8);
  effect.fillCircle(bar.x + bar.width / 2, bar.y + bar.height / 2, 50);

  // 添加文字
  const text = scene.add.text(bar.x + bar.width / 2, bar.y + bar.height / 2, '+1', {
    fontSize: '28px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  text.setOrigin(0.5);

  // 动画效果
  scene.tweens.add({
    targets: [effect, text],
    alpha: 0,
    y: '-=50',
    duration: 800,
    ease: 'Power2',
    onComplete: () => {
      effect.destroy();
      text.destroy();
    }
  });
}

new Phaser.Game(config);
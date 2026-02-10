// 完整的 Phaser3 代码 - 蓝色角色状态切换系统
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态信号
window.__signals__ = {
  currentState: 'idle',
  stateChangeCount: 0,
  timestamp: Date.now()
};

function preload() {
  // 程序化生成蓝色角色纹理
  generateCharacterTextures.call(this);
}

function create() {
  // 创建状态文本显示
  this.stateText = this.add.text(20, 20, 'State: IDLE', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });

  this.instructionText = this.add.text(20, 60, 'Press I for IDLE | Press R for RUN', {
    fontSize: '18px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });

  this.counterText = this.add.text(20, 100, 'State Changes: 0', {
    fontSize: '18px',
    color: '#ffff00',
    fontFamily: 'Arial'
  });

  // 创建角色精灵
  this.player = this.add.sprite(400, 300, 'idle_0');
  this.player.setScale(2);

  // 创建 IDLE 动画（4帧，轻微呼吸效果）
  this.anims.create({
    key: 'idle',
    frames: [
      { key: 'idle_0' },
      { key: 'idle_1' },
      { key: 'idle_2' },
      { key: 'idle_3' }
    ],
    frameRate: 4,
    repeat: -1
  });

  // 创建 RUN 动画（4帧，快速切换）
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'run_0' },
      { key: 'run_1' },
      { key: 'run_2' },
      { key: 'run_3' }
    ],
    frameRate: 10,
    repeat: -1
  });

  // 初始状态为 idle
  this.currentState = 'idle';
  this.player.play('idle');

  // 键盘输入监听
  this.input.keyboard.on('keydown-I', () => {
    this.switchState('idle');
  });

  this.input.keyboard.on('keydown-R', () => {
    this.switchState('run');
  });

  // 添加背景网格
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  for (let i = 0; i < 800; i += 50) {
    graphics.lineBetween(i, 0, i, 600);
  }
  for (let i = 0; i < 600; i += 50) {
    graphics.lineBetween(0, i, 800, i);
  }

  console.log('[INIT] Character state system initialized');
}

function update(time, delta) {
  // 持续更新信号
  window.__signals__.timestamp = time;
}

// 状态切换函数
function switchState(newState) {
  if (this.currentState === newState) {
    return; // 已经是当前状态，不切换
  }

  this.currentState = newState;
  
  // 更新信号
  window.__signals__.currentState = newState;
  window.__signals__.stateChangeCount++;
  
  // 更新文本显示
  this.stateText.setText(`State: ${newState.toUpperCase()}`);
  this.counterText.setText(`State Changes: ${window.__signals__.stateChangeCount}`);

  // 播放对应动画
  this.player.play(newState);

  // 添加状态切换的视觉反馈 tween
  if (newState === 'idle') {
    // IDLE 状态：缩放效果 + 轻微旋转
    this.tweens.add({
      targets: this.player,
      scaleX: 2.2,
      scaleY: 2.2,
      angle: -5,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.player.setAngle(0);
      }
    });
  } else if (newState === 'run') {
    // RUN 状态：快速抖动效果
    this.tweens.add({
      targets: this.player,
      scaleX: 2.3,
      scaleY: 1.8,
      duration: 100,
      yoyo: true,
      repeat: 2,
      ease: 'Bounce.easeOut'
    });

    // 添加水平移动 tween
    this.tweens.add({
      targets: this.player,
      x: this.player.x + 50,
      duration: 300,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });
  }

  // 输出日志
  console.log(JSON.stringify({
    event: 'stateChange',
    newState: newState,
    totalChanges: window.__signals__.stateChangeCount,
    timestamp: Date.now()
  }));
}

// 程序化生成角色纹理
function generateCharacterTextures() {
  const width = 64;
  const height = 64;

  // 生成 IDLE 状态的 4 帧（呼吸效果）
  for (let i = 0; i < 4; i++) {
    const graphics = this.add.graphics();
    const scale = 1 + Math.sin(i * Math.PI / 2) * 0.1; // 呼吸缩放
    
    // 身体（蓝色矩形）
    graphics.fillStyle(0x4488ff, 1);
    graphics.fillRect(
      width / 2 - 12 * scale,
      height / 2 - 8,
      24 * scale,
      32
    );

    // 头部（深蓝色圆形）
    graphics.fillStyle(0x2244aa, 1);
    graphics.fillCircle(width / 2, height / 2 - 16, 10 * scale);

    // 眼睛
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(width / 2 - 4, height / 2 - 18, 2);
    graphics.fillCircle(width / 2 + 4, height / 2 - 18, 2);

    graphics.generateTexture(`idle_${i}`, width, height);
    graphics.destroy();
  }

  // 生成 RUN 状态的 4 帧（跑步动画）
  for (let i = 0; i < 4; i++) {
    const graphics = this.add.graphics();
    const legOffset = (i % 2) * 8 - 4; // 腿部偏移
    const bodyTilt = Math.sin(i * Math.PI / 2) * 5; // 身体倾斜
    
    // 身体（蓝色矩形，带倾斜）
    graphics.fillStyle(0x4488ff, 1);
    graphics.save();
    graphics.translate(width / 2, height / 2);
    graphics.rotate(bodyTilt * Math.PI / 180);
    graphics.fillRect(-12, -8, 24, 32);
    graphics.restore();

    // 头部（深蓝色圆形）
    graphics.fillStyle(0x2244aa, 1);
    graphics.fillCircle(width / 2, height / 2 - 16, 10);

    // 眼睛（跑步时眯起）
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(width / 2 - 5, height / 2 - 18, 3, 1);
    graphics.fillRect(width / 2 + 2, height / 2 - 18, 3, 1);

    // 腿部（简单线条表示）
    graphics.lineStyle(3, 0x2244aa, 1);
    graphics.lineBetween(width / 2 - 4, height / 2 + 24, width / 2 - 4 + legOffset, height / 2 + 36);
    graphics.lineBetween(width / 2 + 4, height / 2 + 24, width / 2 + 4 - legOffset, height / 2 + 36);

    graphics.generateTexture(`run_${i}`, width, height);
    graphics.destroy();
  }
}

new Phaser.Game(config);